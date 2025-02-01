const axios2 = require("axios");

const BACKEND_URL = "http://localhost:3002";
// const WS_URL = "ws://localhost:3001";

const getAuthToken = async (role) => {
  const email = `ashish-${Math.random()}@gmail.com`;
  const password = "123456234";
  const name = `ashish-${Math.random()}@gmail.com`;

  await axios.post(`${BACKEND_URL}/api/v1/signup`, {
    email,
    password,
    name,
    role: role,
  });

  const response = await axios.post(
    `${BACKEND_URL}/api/v1/signin`,
    {
      email,
      password,
    },
    {
      withCredentials: true,
    }
  );
  return {
    token: response.data.accessToken,
    userId: response.data.userId,
  };
};

const axios = {
  post: async (...args) => {
    try {
      const res = await axios2.post(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  get: async (...args) => {
    try {
      const res = await axios2.get(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  put: async (...args) => {
    try {
      const res = await axios2.put(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  delete: async (...args) => {
    try {
      const res = await axios2.delete(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
};

describe("Authentication", () => {
  let token = "";
  test("User should be able to signup only once", async () => {
    const name = `ashish-${Math.random()}@gmail.com`;
    const password = "123456234789";
    const email = `ashish-${Math.random()}@gmail.com`;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      email,
      password,
      name,
      role: "ADMIN",
    });

    token = response.data.accessToken;
    console.log(token, "token form signup");
    expect(response.status).toBe(201);
    expect(response.data.userId).toBeDefined();

    const newResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      email,
      password,
    });

    expect(newResponse.status).toBe(400);
  });

  test("Signup request should fail if no email is provided", async () => {
    const email = `ashish-${Math.random()}@gmail.com`;
    const password = `123456234`;
    let token = "";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
    });

    expect(response.status).toBe(400);
  });

  test("Signin successful if the email and password are correct ", async () => {
    const email = `ashish-${Math.random()}@gmail.com`;
    const password = `123456234`;
    const name = `ashish-${Math.random()}@gmail.com`;
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      email,
      password,
      name,
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      email,
      password,
    });
    token = response.data.accessToken;
    console.log(token, "token form signin");

    expect(response.status).toBe(200);
    expect(response.data.accessToken).toBeDefined();
    expect(response.data.userId).toBeDefined();
  });

  test("Signin fails if the email or password is incorrect", async () => {
    const email = `ashish-${Math.random()}@gmail.com`;
    const password = `123456234`;
    const name = `ashish-${Math.random()}@gmail.com`;
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      email,
      password,
      name,
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      email: "wrong-email@gmail.com",
      password,
    });

    expect(response.status).toBe(404);
  });
});

describe("User metadata endpoint check", () => {
  let avatarId = "";

  beforeAll(async () => {
    const { token, userId } = await getAuthToken("ADMIN");

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${token}`,
        },
      }
    );

    avatarId = avatarResponse.data.avatarId;
    console.log("avatar id from test--", avatarId);
  });

  test("User cant update their metadata with wrong avatar id", async () => {
    const { token } = await getAuthToken("USER");

    const metadataResponse = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "wrong-id",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${token}`,
        },
      }
    );

    expect(metadataResponse.status).toBe(400);
    expect(metadataResponse.data.success).toBe(false);
    expect(metadataResponse.data.message).toBe("Invalid avatar ID");
  });

  test("User can update their metadata with right avatar id", async () => {
    const { token } = await getAuthToken("USER");
    const updateMetaData = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          Cookie: `accessToken=${token}`,
        },
      }
    );

    expect(updateMetaData.status).toBe(200);
  });

  test("User should not able to update metadata if no auth header present", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId,
    });

    expect(response.status).toBe(401);
  });
});

describe("User avatar information", () => {
  let avatarId;
  let token;

  beforeAll(async () => {
    const { token, userId } = await getAuthToken("ADMIN");

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${token}`,
        },
      }
    );

    avatarId = avatarResponse.data.avatarId;
    console.log("avatar id from test--", avatarId);
  });

  test("Get back avatar info for user", async () => {
    token = await getAuthToken("USER");
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=["${avatarId}"]`,
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${token}`,
        },
      }
    );

    console.log("crazy console", response.data, "response data");
    expect(response.status).toBe(200);
    expect(response.data.success).toBeDefined();
    expect(response.data.avatars.length).not.toBe(0);
    expect(response.data.avatars[0].avatarId).toBe(avatarId);
  });

  test("Get all the available avatar", async () => {
    token = await getAuthToken("USER");
    console.log(token, "token");
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`, {
      headers: {
        Cookie: `accessToken=${token}`,
      },
    });

    console.log(response, "response data");

    expect(response.data.data.length).not.toBe(0);
    const currentAvatar = response.data.data.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});

describe("Space information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userToken;
  let userId;
  let lengthOfSpace;

  beforeAll(async () => {
    const email = `ashish-${Math.random()}@gmail.com`;
    const password = "123456234";
    const name = `ashish-${Math.random()}@gmail.com`;
    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      email,
      password,
      name,
      role: "ADMIN",
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      email,
      password,
    });

    adminToken = response.data.accessToken;
    console.log("adminToken", adminToken);

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        email: "user-" + email,
        name: "user-" + name,
        password,
        role: "USER",
      }
    );

    userId = userSignupResponse.data.userId;
    console.log("userId", userId);
    const userSigninResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        email: "user-" + email,
        password,
      }
    );

    userToken = userSigninResponse.data.accessToken;
    console.log("userToken", userToken);

    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    console.log("element1Response", element1Response.data);
    console.log("element2Response", element2Response.data);
    element1Id = element1Response.data.elementId;
    element2Id = element2Response.data.elementId;
    console.log("element1Id", element1Id);
    console.log("element2Id", element2Id);
    const map = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "Test space",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );
    console.log("map", map.data);

    mapId = map.data.mapId;
    console.log("mapId", mapId);
  });

  test("User should able to create space", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.spaceId).toBeDefined();
  });

  test("User is  able to create space without mapId (empty space)", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(response.data.spaceId).toBeDefined();
  });

  test("User should not be able to create space without mapId and dimension", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(response.data.spaceId).not.toBeDefined();
  });

  test("User is not able to delete map which does not exits", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space/radomIdDoesNotExits`,
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(response.status).toBe(404);
  });

  test("User should able to delete a space that does exits", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );
    let id = response.data.spaceId;

    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${id}`,
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(deleteResponse.status).toBe(200);
  });

  test("User should not be able to delete a space created by another user", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    expect(deleteResponse.status).toBe(401);
  });

  test("Admins don't have space initially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      withCredentials: true,
      headers: {
        Cookie: `accessToken=${adminToken}`,
      },
    });
    console.log("response", response.data);
    lengthOfSpace = response.data.spaces.length;
    expect(lengthOfSpace).toBeDefined();
  });

  test("Admin gets one space after", async () => {
    const spaceCreateResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      withCredentials: true,
      headers: {
        Cookie: `accessToken=${adminToken}`,
      },
    });

    const filteredSpace = response.data.spaces.find(
      (x) => x.id === spaceCreateResponse.data.spaceId
    );

    console.log("filteredSpace", filteredSpace);
    console.log("filteredSpace", filteredSpace);
    expect(response.data.spaces.length).toBe(lengthOfSpace + 1);
    expect(filteredSpace).toBeDefined();
  });
});

describe("Arena endpoints", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;

  let userToken;
  let userId;
  let spaceId;

  beforeAll(async () => {
    const email = `ashish-${Math.random()}@gmail.com`;
    const password = "123456232";
    const name = `ashish-${Math.random()}@gmail.com`;
    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      email,
      password,
      name,
      role: "ADMIN",
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      email,
      password,
    });

    adminToken = response.data.accessToken;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        email: "user-" + email,
        password,
        name: "user-" + name,
        role: "USER",
      }
    );

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        email: "user-" + email,
        password,
      }
    );

    userToken = userSigninResponse.data.accessToken;

    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    element1Id = element1Response.data.elementId;
    element2Id = element2Response.data.elementId;

    const map = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "Test space",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    mapId = map.data.mapId;

    const space = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    spaceId = space.data.spaceId;
  });

  test("Incorrect spaceId returns a 400", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/space/random123dfsd`,
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(response.status).toBe(404);
  });

  test("Correct spaceId returns all the element", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      withCredentials: true,
      headers: {
        Cookie: `accessToken=${userToken}`,
      },
    });

    expect(response.data.dimension).toBe("100x200");
    expect(response.data.elements.length).toBe(3);
  });

  test("Delete endpoint is able to delete an element", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      withCredentials: true,
      headers: {
        Cookie: `accessToken=${userToken}`,
      },
    });
    const id = response.data.elements[0].id;

    await axios.delete(`${BACKEND_URL}/api/v1/space/element/${id}`, {
      withCredentials: true,
      headers: {
        Cookie: `accessToken=${userToken}`,
      },
    });

    const newResponse = await axios.get(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(newResponse.data.elements.length).toBe(2);
  });

  test("Adding an element fails if the element lies outside the dimension", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 10000,
        y: 210000,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(response.status).toBe(400);
  });

  test("Adding an element works as expected", async () => {
    await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    const newResponse = await axios.get(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(newResponse.data.elements.length).toBe(3);
  });
});

describe("Admin endpoints", () => {
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll(async () => {
    const email = `ashish-${Math.random()}@gmail.com`;
    const password = "123456234";
    const name = `ashish-${Math.random()}@gmail.com`;
    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      email,
      password,
      name,
      role: "ADMIN",
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      email,
      password,
    });

    adminToken = response.data.accessToken;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        email: "user-" + email,
        password,
        name: "user-" + name,
        role: "USER",
      }
    );

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        email: "user-" + email,
        password,
      }
    );

    userToken = userSigninResponse.data.accessToken;
  });

  test("User is not able to hit admin endpoints", async () => {
    const elementResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "test space",
        defaultElements: [
          {
            elementId: "1234",
            x: 20,
            y: 20,
          },
          {
            elementId: "1234",
            x: 20,
            y: 20,
          },
          {
            elementId: "1234",
            x: 20,
            y: 20,
          },
        ],
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    const createAvatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    const updateElementResponse = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/123`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${userToken}`,
        },
      }
    );

    expect(elementResponse.status).toBe(401);
    expect(mapResponse.status).toBe(401);
    expect(createAvatarResponse.status).toBe(401);
    expect(updateElementResponse.status).toBe(401);
  });

  test("Admin is able to hit admin endpoints", async () => {
    const elementResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        name: "Space",
        dimensions: "100x200",
        defaultElements: [],
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );
    expect(elementResponse.status).toBe(200);
    expect(mapResponse.status).toBe(200);
    expect(avatarResponse.status).toBe(200);
  });

  test("Admin is able to update the imageUrl for an element", async () => {
    const elementResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    const updateElementResponse = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.elementId}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      },
      {
        withCredentials: true,
        headers: {
          Cookie: `accessToken=${adminToken}`,
        },
      }
    );

    expect(updateElementResponse.status).toBe(200);
  });
});

// describe("Websocket test", () => {
//   let adminToken;
//   let adminUserId;
//   let userToken;
//   let adminId;
//   let userId;
//   let mapId;
//   let element1Id;
//   let element2Id;
//   let spaceId;
//   let ws1;
//   let ws2;
//   let ws1Messages = [];
//   let ws2Messages = [];
//   let userX;
//   let userY;
//   let adminX;
//   let adminY;

//   function waitForPopLatestMessage(messageArray) {
//     return new Promise((resolve) => {
//       if (messageArray.length > 0) {
//         resolve(messageArray.shift());
//       } else {
//         let interval = setInterval(() => {
//           if (messageArray.length > 0) {
//             resolve(messageArray.shift());
//             clearInterval(interval);
//           }
//         }, 100);
//       }
//     });
//   }

//   async function setupHttp() {
//     const username = `ashish-${Math.random()}`;
//     const password = "123456";

//     const adminSignupResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/signup`,
//       {
//         username,
//         password,
//         type: "admin",
//       }
//     );

//     const adminSigninResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/signin`,
//       {
//         username,
//         password,
//       }
//     );

//     adminUserId = adminSignupResponse.data.userId;
//     adminToken = adminSigninResponse.data.token;
//     console.log("adminSignupResponse.status");
//     console.log(adminSignupResponse.status);

//     const userSignupResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/signup`,
//       {
//         username: username + `-user`,
//         password,
//         type: "user",
//       }
//     );
//     const userSigninResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/signin`,
//       {
//         username: username + `-user`,
//         password,
//       }
//     );
//     userId = userSignupResponse.data.userId;
//     userToken = userSigninResponse.data.token;
//     const element1Response = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/element`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//         width: 1,
//         height: 1,
//         static: true,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );

//     const element2Response = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/element`,
//       {
//         imageUrl:
//           "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//         width: 1,
//         height: 1,
//         static: true,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );
//     element1Id = element1Response.data.id;
//     element2Id = element2Response.data.id;
//     const mapResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/admin/map`,
//       {
//         thumbnail: "https://thumbnail.com/a.png",
//         dimensions: "100x200",
//         name: "Defaul space",
//         defaultElements: [
//           {
//             elementId: element1Id,
//             x: 20,
//             y: 20,
//           },
//           {
//             elementId: element1Id,
//             x: 18,
//             y: 20,
//           },
//           {
//             elementId: element2Id,
//             x: 19,
//             y: 20,
//           },
//         ],
//       },
//       {
//         headers: {
//           authorization: `Bearer ${adminToken}`,
//         },
//       }
//     );
//     mapId = mapResponse.data.id;
//     const spaceResponse = await axios.post(
//       `${BACKEND_URL}/api/v1/space`,
//       {
//         name: "Test",
//         dimensions: "100x200",
//         mapId: mapId,
//       },
//       {
//         headers: {
//           authorization: `Bearer ${userToken}`,
//         },
//       }
//     );

//     console.log(spaceResponse.status);
//     spaceId = spaceResponse.data.spaceId;
//   }

//   async function setupWs() {
//     ws1 = new WebSocket();

//     ws1.onmessage = (event) => {
//       console.log("got back data 1");
//       console.log(event.data);

//       ws1Messages.push(JSON.parse(event.data));
//     };

//     await new Promise((r) => {
//       ws1.onopen = r;
//     });

//     ws2 = new WebSocket(WS_URL);

//     ws2.onmessage = (event) => {
//       console.log("got back data 2");
//       console.log(event.data);
//       ws2Messages.push(JSON.parse(event.data));
//     };

//     await new Promise((r) => {
//       ws2.onopen = r;
//     });
//   }

//   beforeAll(async () => {
//     await setupHttp();
//     await setupWs();
//   });

//   test("Get back acknowledgement for joining the space", async () => {
//     ws1.send(
//       JSON.stringify({
//         type: "join",
//         payload: {
//           spaceId: spaceId,
//           token: adminToken,
//         },
//       })
//     );

//     const message1 = await waitForPopLatestMessage(ws1Messages);

//     ws2.send(
//       JSON.stringify({
//         type: "join",
//         payload: {
//           spaceId: spaceId,
//           token: adminToken,
//         },
//       })
//     );

//     const message2 = await waitForAndPopLatestMessage(ws2Messages);
//     const message3 = await waitForAndPopLatestMessage(ws1Messages);

//     expect(message1.type).toBe("space-joined");
//     expect(message2.type).toBe("space-joined");
//     expect(message1.payload.users.length).toBe(0);
//     expect(message2.payload.users.length).toBe(1);
//     expect(message3.type).toBe("user-joined");
//     expect(message3.payload.x).toBe(message2.payload.spawn.x);
//     expect(message3.payload.y).toBe(message2.payload.spawn.y);
//     expect(message3.payload.userId).toBe(userId);

//     adminX = message1.payload.spawn.x;
//     adminY = message1.payload.spawn.y;

//     userX = message2.payload.spawn.x;
//     userY = message2.payload.spawn.y;
//   });

//   test("User should not be able to move across the boumdary of the wall", async () => {
//     ws1.send(
//       JSON.stringify({
//         type: "move",
//         payload: {
//           x: 10000000,
//           y: 10000,
//         },
//       })
//     );

//     const message = await waitForPopLatestMessage(ws1Messages);
//     expect(message.type).toBe("movement-rejected");
//     expect(message.payload.x).toBe(adminX);
//     expect(message.payload.y).toBe(adminY);
//   });

//   test("User shoulf not be able to move two block at the same time", async () => {
//     ws1.send(
//       JSON.stringify({
//         type: "move",
//         payload: {
//           x: adminX + 2,
//           y: adminY,
//         },
//       })
//     );

//     const message = await waitForAndPopLatestMessage(ws1Messages);
//     expect(message.type).toBe("movement-rejected");
//     expect(message.payload.x).toBe(adminX);
//     expect(message.payload.y).toBe(adminY);
//   });

//   test("Correct movement should be broadcasted to the other socket in the room", async () => {
//     ws1.send(
//       JSON.stringify({
//         type: "move",
//         payload: {
//           x: adminX + 1,
//           y: adminY,
//           userId: adminId,
//         },
//       })
//     );

//     const message = await waitForAndPopLatestMessage(ws2Messages);
//     expect(message.type).toBe("movement");
//     expect(message.payload.x).toBe(adminX + 1);
//     expect(message.payload.y).toBe(adminY);
//   });

//   test("If a user leaves, the other user receives a leave event", async () => {
//     ws1.close();
//     const message = await waitForAndPopLatestMessage(ws2Messages);
//     expect(message.type).toBe("user-left");
//     expect(message.payload.userId).toBe(adminUserId);
//   });
// });
