import express from 'express';
import fetch, { FormData } from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Generating image for prompt: "${prompt}"`);

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('model', 'stable-diffusion-v1-6');
    formData.append('width', '512');
    formData.append('height', '512');
    formData.append('output_format', 'jpeg'); // match MIME type

    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          'Accept': 'image/*', // allow any image type
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability AI error:', errorText);
      return res.status(response.status).send(errorText);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = buffer.toString('base64');

    res.status(200).json({ photo: `data:image/jpeg;base64,${imageBase64}` });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Something went wrong generating the image' });
  }
});


export default router;
