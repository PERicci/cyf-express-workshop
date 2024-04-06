import express from 'express';
import formidable from 'express-formidable';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const postsPath = `${__dirname}/data/posts.json`

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}. Ready to accept requests!`);
});

app.use(express.static('public'));
app.use(formidable())

app.post('/create-post', async (req, res) => {
  const newPostContent = req.fields.blogpost;

  try {
    const previousPosts = await readPreviousPosts(postsPath);
    const newPost = newPostBuilder(newPostContent);

    const updatedPosts = { ...previousPosts, ...newPost };
    console.log(updatedPosts);

    fs.writeFile(postsPath, JSON.stringify(updatedPosts, null, 2))
      .then(() => res.sendFile(postsPath))

  } catch (error) {
    console.error('Error reading the file:', error);
  }
});

app.get('/get-posts', async (req, res) => {
  try {
    const posts = await readPreviousPosts(postsPath);
    res.json(posts);
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});


async function readPreviousPosts(filePath) {
  const file = await fs.readFile(filePath);
  return JSON.parse(file.toString());
}

function newPostBuilder(newPostContent) {
  const newPostTimestamp = Date.now().toString();
  const newPost = {}

  newPost[newPostTimestamp] = newPostContent

  return newPost;
}