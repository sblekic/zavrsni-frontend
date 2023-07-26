import axios from "axios";

// instanciranje axios-a
let Backend = axios.create({
  baseURL: "https://showstarter-api.onrender.com/",
  timeout: 7000,
});

// naš objekt za sve pozive koji se dotiču `Post`ova
let Posts = {
  async getAll() {
    let response = await Backend.get("/posts");
    let posts = response.data.map((doc) => {
      return {
        id: doc.id,
        url: doc.source,
        email: doc.createdBy,
        title: doc.title,
        posted_at: Number(doc.postedAt),
      };
    });

    return posts;
  },
};

let Auth = {
  async requestMessage(userData) {
    let { data } = await Backend.post("/request-message", userData, {
      headers: { "Content-Type": "application/json" },
    });
    // console.log(data);
    let message = data.message;
    return message;
  },

  async verifySignature(message, signature) {
    let res = await Backend.post(
      "/verify",
      {
        message,
        signature,
      },
      { withCredentials: true } // what is dis?
    );
    return res;
  },

  async logOut() {
    await Backend.get("/logout", { withCredentials: true });
  },

  async auth() {
    let res = await Backend.get("/authenticate", { withCredentials: true });
    return res;
  },
};
export { Backend, Posts, Auth }; // Backend za ručne pozive ostalo za api endpoints;
