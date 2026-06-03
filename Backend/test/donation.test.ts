import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/server';
import User from '../src/models/User';
import Notification from '../src/models/Notification';

// Avoid real image uploads in the donation flow.
vi.mock('../src/utils/uploadImage', () => ({
  default: vi.fn().mockResolvedValue('https://example.com/img.jpg'),
}));

async function createApprovedUser(role: string, email: string, extra: Record<string, unknown> = {}) {
  await request(app)
    .post('/api/auth/register')
    .send({ name: `${role} user`, email, password: 'secret123', role, ...extra });
  await User.updateOne({ email }, { $set: { isApproved: true } });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'secret123' });
  return login.body.token as string;
}

describe('Donation → notification flow', () => {
  it('lets a donor create a donation and notifies NGOs', async () => {
    const donorToken = await createApprovedUser('donor', 'd@test.com');
    await createApprovedUser('ngo', 'n@test.com', {
      organization_name: 'Org A',
      contact_number: '123',
    });

    const res = await request(app)
      .post('/api/donor/donate')
      .set('Authorization', `Bearer ${donorToken}`)
      .field('title', 'Fresh Bread')
      .field('description', 'A box of fresh bread')
      .field('quantity', '10')
      .field('unit', 'loaves')
      .field('expiry_time', new Date(Date.now() + 86400000).toISOString())
      .field('pickup_window_start', '10:00')
      .field('pickup_window_end', '12:00')
      .field('contact_number', '123');

    expect(res.status).toBe(201);
    expect(res.body.food.title).toBe('Fresh Bread');

    // The NGO should have received a "new_donation" notification.
    const ngo = await User.findOne({ email: 'n@test.com' });
    const notes = await Notification.find({ recipientId: ngo!._id });
    expect(notes.length).toBe(1);
    expect(notes[0].type).toBe('new_donation');
  });

  it('exposes available foods publicly and reflects donor stats', async () => {
    const donorToken = await createApprovedUser('donor', 'd2@test.com');

    await request(app)
      .post('/api/donor/donate')
      .set('Authorization', `Bearer ${donorToken}`)
      .field('title', 'Rice')
      .field('description', 'Bag of rice')
      .field('quantity', '5')
      .field('expiry_time', new Date(Date.now() + 86400000).toISOString())
      .field('pickup_window_start', '09:00')
      .field('pickup_window_end', '11:00');

    const available = await request(app).get('/api/food/available');
    expect(available.status).toBe(200);
    expect(available.body.length).toBe(1);

    const stats = await request(app)
      .get('/api/donor/stats')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(stats.body.totalDonations).toBe(1);
    expect(stats.body.pendingDonations).toBe(1);
  });

  it('lets an NGO claim an available donation', async () => {
    const donorToken = await createApprovedUser('donor', 'd3@test.com');
    const ngoToken = await createApprovedUser('ngo', 'n3@test.com', {
      organization_name: 'Org B',
      contact_number: '123',
    });

    const donation = await request(app)
      .post('/api/donor/donate')
      .set('Authorization', `Bearer ${donorToken}`)
      .field('title', 'Soup')
      .field('description', 'Pot of soup')
      .field('quantity', '8')
      .field('expiry_time', new Date(Date.now() + 86400000).toISOString())
      .field('pickup_window_start', '10:00')
      .field('pickup_window_end', '12:00');

    const foodId = donation.body.food._id;

    const claim = await request(app)
      .post('/api/ngo/claim/food')
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({ foodId });

    expect(claim.status).toBe(200);
    expect(claim.body.data.status).toBe('assigned');

    // No longer available publicly.
    const available = await request(app).get('/api/food/available');
    expect(available.body.length).toBe(0);
  });
});
