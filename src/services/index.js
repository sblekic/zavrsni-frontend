import axios from "axios";

// instanciranje axios-a
let Backend = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_URL,
  timeout: 7000,
});

let Exchange = {
  async eurToEth() {
    let response = await axios.get(
      "https://api.coinbase.com/v2/exchange-rates?currency=EUR"
    );
    let rate = response.data.data.rates.ETH;
    console.log("rate", rate);
    let wei = parseFloat(rate) * 10 ** 18;
    return wei;
    // console.log("rate in wei", wei);
    // let exchange = eur * wei;
    // return exchange;
  },
};
// naš objekt za sve pozive koji se dotiču `Post`ova
let Posts = {
  async getAll() {
    let response = await Backend.get("/posts", { withCredentials: true });
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

let Events = {
  async getEvents() {
    try {
      let response = await Backend.get("/events");
      let events = response.data.map((doc) => {
        return {
          id: doc.ethEventAddress,
          name: doc.name,
          date: new Intl.DateTimeFormat("hr", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
            .format(doc.startTime * 1000)
            .replace(/\s/g, ""),
          dayHour: `${new Intl.DateTimeFormat("hr", {
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
          })
            .format(doc.startTime * 1000)
            .replace(/\s/g, " - ")}`,
          location: `${doc.venue.name}, ${doc.venue.city}`,
        };
      });

      return events;
    } catch (error) {
      console.log(error);
    }
  },
  async getEventById(id) {
    try {
      let response = await Backend.get(`/events/${id}`);
      let doc = response.data;
      let venueRequest = await Backend.get("/venues", {
        params: {
          _any: doc.venue.name,
        },
      });

      let customDate = new Intl.DateTimeFormat("hr", {
        weekday: "long",
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
        .format(doc.startTime * 1000)
        .replace(/\s/g, "")
        .replace(",", ", ");

      customDate = customDate.slice(0, -5) + " - " + customDate.slice(-5);
      let event = {
        name: doc.name,
        location: `${doc.venue.name}, ${doc.venue.city}`,
        dayHour: customDate,
        startStamp: doc.startTime,
        tickets: doc.tickets,
        lineup: doc.lineup,
        venueInfo: venueRequest.data[0],
      };
      return event;
    } catch (error) {
      console.log(error);
    }
  },

  async postEvent(event) {
    try {
      return await Backend.post("/events", event);
    } catch (error) {
      console.log(error);
    }
  },
};

let Tickets = {
  async postTicketMeta(ticket) {
    try {
      return await Backend.post("/tickets", ticket);
    } catch (error) {
      console.log(error);
    }
  },
};

let Venues = {
  async getVenues(searchTerm) {
    try {
      let options = {};

      if (searchTerm) {
        options.params = {
          _any: searchTerm,
        };
      }

      let res = await Backend.get("/venues", options);
      let venues = res.data;
      return venues;
    } catch (error) {
      console.log(error);
    }
  },
};

let Artists = {
  async getArtists(searchTerm) {
    try {
      let options = {};

      if (searchTerm) {
        options.params = {
          _any: searchTerm,
        };
      }

      let res = await Backend.get("/artists", options);
      let artists = res.data;
      return artists;
    } catch (error) {
      console.log(error);
    }
  },
};

let Auth = {
  async requestMessage(userData) {
    let { data } = await Backend.post("/auth/request-message", userData, {
      headers: { "Content-Type": "application/json" },
    });
    // console.log(data);
    let message = data.message;
    return message;
  },

  async verifySignature(message, signature) {
    let res = await Backend.post(
      "/auth/verify",
      {
        message,
        signature,
      },
      { withCredentials: true } // potrebno za primiti/poslati credentials (u mom slučaju cookies) iz response / u request
    );
    return res;
  },

  async logOut() {
    await Backend.get("/auth/logout", { withCredentials: true });
  },

  async auth() {
    let res = await Backend.get("/authenticate", { withCredentials: true });
    return res;
  },
};
export { Backend, Posts, Auth, Venues, Artists, Events, Tickets, Exchange }; // Backend za ručne pozive ostalo za api endpoints;
