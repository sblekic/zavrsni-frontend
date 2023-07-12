import axios from "axios";

// instanciranje axios-a
let Backend = axios.create({
  baseURL: "http://localhost:3000/",
  timeout: 1000,
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
export { Backend, Posts }; // exportamo Service za ručne pozive ili Posts za metode;
