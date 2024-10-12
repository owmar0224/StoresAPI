import { connect } from '../connection/database'; // Adjust import as needed
import { ownerController } from '../controllers/ownerController'; // Adjust import as needed

export default async function handler(req, res) {
  const db = await connect();

  switch (req.method) {
    case 'GET':
      await ownerController.getOwners(req, res, db);
      break;
    case 'POST':
      await ownerController.createOwner(req, res, db);
      break;
    case 'PUT':
      await ownerController.updateOwner(req, res, db);
      break;
    case 'DELETE':
      await ownerController.deleteOwner(req, res, db);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}