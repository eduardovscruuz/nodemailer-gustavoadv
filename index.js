const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;


const cors = require('cors');

const allowedOrigins = ['https://advogadogustavogouvea.com.br', 'https://www.advogadogustavogouvea.com.br'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept'
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// Configuração do multer para armazenar arquivos enviados pelo formulário
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log('Saving file to uploads directory');
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      console.log('Saving file with base name:', path.basename(file.originalname));
      cb(null, path.basename(file.originalname));
    },
  });

const upload = multer({ storage: storage });

app.post('/send-email', upload.single('file'), (req, res) => {
  const { name, email, subject, message } = req.body;

// Configurar o Nodemailer para enviar o e-mail
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'adv.gustavogouvea@gmail.com',
        pass: 'doafbaxfvscetjbt', 
    },
  });

  console.log('req.file:', req.file)
  
  // Configurar o corpo do e-mail
  const mailOptions = {
    from: 'Contato Site! 📩 <adv.gustavogouvea@gmail.com>',
    to: 'gouveagustavo.adv@gmail.com',
    subject: `Mensagem de ${name}, ${email}: ${subject}`,
    text: message,
    replyTo: email,
    attachments: req.file ? [{filename:req.file.originalname, path: path.join(__dirname, 'uploads', req.file.filename) }] : [],
  };

  // Enviar o e-mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      console.log('req.file:', req.file);
      res.status(500).send('Erro ao enviar e-mail');
    } else {
      console.log('E-mail enviado: ' + info.response);
      res.status(200).send('E-mail enviado com sucesso');
    }
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));








