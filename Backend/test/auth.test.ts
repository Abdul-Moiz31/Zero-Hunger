import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';
import User from '../src/models/User';

const register = (body: Record<string, unknown>) =>
  request(app).post('/api/auth/register').send(body);

const approve = (email: string) =>
  User.updateOne({ email }, { $set: { isApproved: true } });

describe('Auth flow', () => {
  const donor = {
    name: 'Test Donor',
    email: 'donor@test.com',
    password: 'secret123',
    role: 'donor',
  };

  it('registers a new user (pending approval)', async () => {
    const res = await register(donor);
    expect(res.status).toBe(201);
    const user = await User.findOne({ email: donor.email });
    expect(user).toBeTruthy();
    expect(user?.isApproved).toBe(false);
  });

  it('rejects invalid registration input', async () => {
    const res = await register({ name: 'x', email: 'bad', password: '1', role: 'donor' });
    expect(res.status).toBe(400);
  });

  it('rejects duplicate registration', async () => {
    await register(donor);
    const res = await register(donor);
    expect(res.status).toBe(409);
  });

  it('blocks login until approved, then succeeds', async () => {
    await register(donor);

    const pending = await request(app)
      .post('/api/auth/login')
      .send({ email: donor.email, password: donor.password });
    expect(pending.status).toBe(403);

    await approve(donor.email);

    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: donor.email, password: donor.password });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();
    // Password must never be returned.
    expect(ok.body.user.password).toBeUndefined();
  });

  it('rejects wrong password', async () => {
    await register(donor);
    await approve(donor.email);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: donor.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('resolves req.user.id on a protected route (the C1 regression)', async () => {
    await register(donor);
    await approve(donor.email);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: donor.email, password: donor.password });
    const token = login.body.token;

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(donor.email);
  });

  it('rejects protected route without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('enforces role authorization', async () => {
    await register(donor);
    await approve(donor.email);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: donor.email, password: donor.password });

    // Donor token on an admin-only route → 403.
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });
});
