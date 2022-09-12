import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// const TOKEN_LENGTH = 176;

describe('I can register then login, refresh my auth token then logout', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const USER_EMAIL = 'valid@email.com';
  const USER_PASSWORD = 'StrongPassword123!@#';

  it('/auth/signup (POST): Register user get back RT & AT with status 201', async () => {
    const req = await request(app.getHttpServer())
      .post('/auth/signup')
      .type('form')
      .send({
        email: USER_EMAIL,
        password: USER_PASSWORD,
      })
      .expect(201);

    expect(req.body['rt']).toBeTruthy();
    expect(req.body['at']).toBeTruthy();
    expect(req.body['email']).toBeTruthy();
  });

  let at: string | undefined = undefined;
  let rt: string | undefined = undefined;

  it('/auth/signin (POST): Login and get RT & AT with status 200', async () => {
    const req = await request(app.getHttpServer())
      .post('/auth/signin')
      .type('form')
      .send({
        email: USER_EMAIL,
        password: USER_PASSWORD,
      })
      .expect(200);
    expect(req.body['rt']).toBeTruthy();
    expect(req.body['at']).toBeTruthy();
    expect(req.body['email']).toBeTruthy();
    rt = req.body['rt'];
    at = req.body['at'];
    expect(typeof at).toBe('string');
    expect(typeof rt).toBe('string');
  });

  it('/auth/refresh (POST): my token should changes when refresh with rt and get status 201', async () => {
    let newAt = '';
    let newRt = '';

    const req = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${rt}`)
      .expect(201);

    newAt = req.body['at'];
    newRt = req.body['rt'];
    expect(typeof newAt).toBe('string');
    expect(typeof newRt).toBe('string');
    expect(newAt).not.toEqual(at);
    expect(newRt).not.toEqual(rt);

    at = newAt;
    rt = newRt;
  });

  it('/auth/signout (POST): I can logout with 200 status code', async () => {
    await request(app.getHttpServer())
      .post('/auth/signout')
      .set('Authorization', `Bearer ${at}`)
      .expect(200);
  });
});
