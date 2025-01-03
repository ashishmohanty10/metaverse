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
    expect(response.data.userId).toBeDefined();

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
    expect(response.data.token).toBeDefined();
    expect(response.data.userId).toBeDefined();
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

describe("User metadata endpoint check", () => {
  let token = "";
  let avatarId = "";

  beforeAll(async () => {
    const username = `ashish-${Math.random()}`;
    const password = "123456";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    token = response.body.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponse.data.id;
  });

  test("User cant update their metadata with wrong avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "wrong-id",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.statusCode).toBe(400);
  });

  test("User can update their metadata with wrong avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.statusCode).toBe(200);
  });

  test("User should not able to update metadata if no auth header present", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId,
    });

    expect(response.statusCode).toBe(403);
  });
});

describe("User avatar information", () => {
  let avatarId;
  let token;
  let userId;

  beforeAll(async () => {
    const username = `ashish-${Math.random()}`;
    const password = "123456";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
    });

    userId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    token = response.body.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponse.data.id;
  });

  test("Get back avatar info for user", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );

    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBeDefined(userId);
  });

  test("Get all the available avatar", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);

    expect(response.data.avatars.length).not.toBe(0);
    const currentAvatar = response.data.avatars.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});
