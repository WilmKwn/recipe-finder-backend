import express, { RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { ImageAnnotatorClient } from '@google-cloud/vision';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = new ImageAnnotatorClient({
  keyFilename: "recipefindercred.json",
});

const detect: RequestHandler = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    // Call the Vision API using the client
    const [result] = await client.labelDetection({
      image: { content: image },
    });

    // TODO: Filter by food & ingredients
    const labels = result.labelAnnotations || [];
    const response: string[] = labels
      .map(label => label.description || "");

    console.log(response);

    res.json(response);
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({"err": "Failed to analyze image"});
  }
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.post('/detect', detect);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
