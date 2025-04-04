import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json'; // Asegúrate de que la ruta es correcta

Amplify.configure(config);

console.log("✅ Amplify configurado con éxito.");
