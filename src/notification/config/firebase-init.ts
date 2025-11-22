import * as admin from 'firebase-admin';
import { fireBase_ENV_PROD } from './firebase_key';

if (!admin.apps.length) {
  admin.initializeApp({
    // credential: admin.credential.cert({
    //   projectId: fireBase_ENV_PROD.project_id,
    //   clientEmail: fireBase_ENV_PROD.client_email,
    //   privateKey: fireBase_ENV_PROD.private_key.replace(/\\n/g, '\n'),
    // }),
  });
}

export { admin };
