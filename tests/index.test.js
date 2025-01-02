const { default: axios } = require("axios");

const BACKEND_URL = "http://localhost:3000";

describe("Authentication", () => {
  test("User should be able to signup only once", async () => {
    const username = `ashish-${Math.random()}`;
    const password = "123456";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    expect(response.statusCode).toBe(200);

    const newResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(newResponse.statusCode).toBe(400);
  });

  test("Signup request should fail if no username is provided", async () => {
    const username = `ashish-${Math.random()}`;
    const password = `123456`;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
    });

    expect(response.statusCode).toBe(400);
  });

  test("Signin successful if the username and password are correct ", async () => {
    const username = `ashish-${Math.random()}`;
    const password = `123456`;

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test("Signin fails if the username or password is incorrect", async () => {
    const username = `ashish-${Math.random()}`;
    const password = `123456`;

    await axios.post(`${BACKEND_URL}/api/v1/signup`);

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "wrong-username",
      password,
    });

    expect(response.statusCode).toBe(403);
  });
});
