import request from 'supertest';
import app from '../server.js';

describe('GET /api/clients/:clientId/fidelite', () => {
  it('should return fidelite data for a valid client with a valid token', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJyb2xlIjoiQ0xJRU5UIiwiZW1haWwiOiJseW5hQGV4YW1wLmNvbSIsImlhdCI6MTc0NzQxOTY0MywiZXhwIjoxNzQ3NDIzMjQzfQ.jPFQUn1nhnb7PtYpUpLXiPlS1Z_588-uzxk-kmiIQr0'; // Mets ton vrai token ici

    const response = await request(app)
      .get('/api/clients/10/fidelite')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id_fidelite');
    expect(response.body).toHaveProperty('solde_points');
  });
});
