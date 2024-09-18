const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')
const bcrypt = require('bcryptjs')
const jokes = require('./jokes/jokes-data')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
afterAll(async () => {
  await db.destroy()
})

test('[0] sanity', () => {
  expect(true).toBe(true)
})

describe('auth-routes', () => {
  describe('[POST] api/auth/register', () => {
    it('[1] creates a new user in the database', async () => {
      await request(server).post('/api/auth/register').send({ username: 'slade', password: '1234' })
      const slade = await db('users').where('username', 'slade').first()
      expect(slade).toMatchObject({ username: 'slade' })
    })
    it('[2] saves the user with a bcrypted password', async () => {
      await request(server).post('/api/auth/register').send({ username: 'slade', password: '1234' })
      const slade = await db('users').where('username', 'slade').first()
      expect(bcrypt.compareSync('1234', slade.password)).toBeTruthy()
    })
  })
  describe('[POST] api/auth/login', () => {
    it('[3] responds with the correct message on valid credentials', async () => {
      const res = await request(server).post('/api/auth/login').send({ username: 'slade', password: '1234'})
      expect(res.body.message).toMatch(/welcome, slade/i)
      })
    it('[4] responds with the correct status and message on invalid credentials', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'sladey', password: '1234'})
      expect(res.body.message).toMatch(/invalid credentials/i)
      expect(res.status).toBe(401)
      res = await request(server).post('/api/auth/login').send({ username: 'slade', password: '12345'})
      expect(res.body.message).toMatch(/invalid credentials/i)
      expect(res.status).toBe(401)
    })
  })
  describe('[GET] api/jokes', () => {
    it('[5] request without a token recieve proper message', async () => {
      let res = await request(server).get('/api/jokes')
      expect(res.body.message).toMatch('token required')
    })
    it('[6] requests with valid token recieve jokes', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'slade', password: '1234' })
      res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
      expect(res.body).toMatchObject(jokes)
    })
  })
})
