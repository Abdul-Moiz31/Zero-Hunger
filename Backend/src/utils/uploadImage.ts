interface FileWithBuffer {
  buffer: Buffer;
  size: number;
}

const uploadImage = async (file: FileWithBuffer) => {
  try {
    if (!file) throw new Error('No file provided');
    if (file.size > 5 * 1024 * 1024) throw new Error('File size exceeds 5MB');

    const base64Image = file.buffer.toString('base64');
    const key = process.env.IMGBB_KEY;
    if (!key) throw new Error('IMGBB API key is not defined');

    const formData = new FormData();
    formData.append('image', base64Image);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Image upload failed: ' + (error instanceof Error ? error.message : String(error)));
  }
};

export default uploadImage;
  