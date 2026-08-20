new window.Vue({
  el: "#app",

  computed: {
    albumsByYearDesc: function() {
      return this.entries.music.sort(function(a1, a2) {
        if (a1.year === a2.year) return a1.artist - a2.artist;
        return a2.year - a1.year;
      });
    },
  },

  data: {
    artistLinks: {
      "Dan Francia":
        "https://open.spotify.com/artist/1kmzpT5vAtlo9EMi0RYr28?si=CVUGiPQ0SdGeUxbzpEZI3Q",
    },

    labelLinks: {
      "Shea Stadium Records": "http://www.sheastadiumrecords.nyc/",
      "Exploding In Sound": "https://www.explodinginsoundrecords.com/",
    },

    entries: {
      music: [
        {
          artist: "Dan Francia",
          year: "2019",
          title: "Come Back To Life",
          label: "Exploding In Sound",
          image: null,
          url: "https://open.spotify.com/album/4bZlkYt3pKT90sEJSjm9s2?si=uflHN35gTyKlrNxdrqbTwQ",
          role: "Everything",
        },
        {
          artist: "Dan Francia",
          year: "2020",
          title: "Dust",
          label: "Shea Stadium Records",
          image: null,
          url: "https://open.spotify.com/album/6iHGMV4nBTBKT5dzs9G9k9?si=-yDQ-ErrTRmJNR9_zqNrFQ",
          role: "Everything",
        },
        {
          artist: "Dan Francia",
          year: "2025",
          title: "There Is A Way",
          label: "Dan Francia",
          image: null,
          url: "https://danfrancia.bandcamp.com/album/there-is-a-way",
          role: "Everything"
        }
      ],
    },
  },
});
