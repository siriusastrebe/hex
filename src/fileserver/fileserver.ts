import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import 'dotenv/config';

const ENV: string = process.env.ENV || 'DEVELOPMENT';

const PORT: number = Number(process.env.PORT) || 3000;

const app: Express = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 204 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.sendFile(process.cwd() + '/dist/index.html');
});

app.get('/assets/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  console.log(filename);
  res.sendFile(process.cwd() + '/dist/assets/' + filename);
});

app.get('/public/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  console.log(filename)
  res.sendFile(process.cwd() + '/public/' + filename);
});

app.listen(PORT, () => {
  console.log(`${ENV} Frontend fileserver is running on port ${PORT}`);
});
