new window.Vue({
  el: '#app',

  computed: {
    albumsByYearDesc: function () {
      return this.entries.music.sort(function (a1, a2) {
        if (a1.year === a2.year) return a1.artist - a2.artist
        return a2.year - a1.year
      })
    }
  },

  data: {
    artistLinks: {
      'Lost Boy ?': 'https://open.spotify.com/artist/77r9V5rYD5N6G2SJIZ9wYf?si=-eDl2O4IQrKDt6ALZ9mbkw',
      'Titus Andronicus': 'https://open.spotify.com/artist/5lJ4XQ2hlPlxACN7q3xKL1?si=uJHKT1KvTbqVg43EKCs9ug',
      'Dan Francia': 'https://open.spotify.com/artist/1kmzpT5vAtlo9EMi0RYr28?si=CVUGiPQ0SdGeUxbzpEZI3Q'
    },

    labelLinks: {
      'Merge Records': 'https://www.mergerecords.com/',
      'Shea Stadium Records': 'http://www.sheastadiumrecords.nyc/',
      'Exploding In Sound': 'https://www.explodinginsoundrecords.com/',
      'XL Recordings': 'https://xlrecordings.com/'
    },

    entries: {
      code: [
        { label: 'Linkedin', url: 'https://www.linkedin.com/in/eric-harm-800797120/' },
        { label: 'Github', url: 'https://github.com/ericharm' }
      ],

      chess: [
        { label: 'Chess.com', url: 'https://www.chess.com/member/e_harm' },
        { label: 'Lichess', url: 'https://lichess.org/@/ericharm' }
      ],

      music: [
        {
          artist: 'Titus Andronicus',
          year: '2010',
          title: 'The Monitor',
          label: 'XL Recordings',
          image: null,
          spotifyUrl: 'https://open.spotify.com/album/5U09FQWagzAU5HPmufUAlU?si=6h8UnZT5TlqKkPk3CfUszg',
          role: 'Drums'
        },

        {
          artist: 'Titus Andronicus',
          year: '2012',
          title: 'Local Business',
          label: 'XL Recordings',
          image: null,
          spotifyUrl: 'https://open.spotify.com/album/4dx4Khp1YnIcZrTTdRHy1I?si=sYtXN1SLSImI3xDxAYwofA',
          role: 'Drums'
        },

        {
          artist: 'Titus Andronicus',
          year: '2015',
          title: 'The Most Lamentable Tragedy',
          label: 'Merge Records',
          image: null,
          spotifyUrl: 'https://open.spotify.com/album/6tcFu0TqSurn0s4unYDXSO?si=HKxKGzZCQIOHbeSX6uOgbQ',
          role: 'Drums'
        },

        {
          artist: 'Titus Andronicus',
          year: '2016',
          title: 'S+@dium Rock: 5 Nights at the Opera',
          label: 'Merge Records',
          image: null,
          spotifyUrl: 'https://open.spotify.com/album/1HEQ4svrZgFrBjmL65UY9a?si=OyxgxATfRwiGMM9MbrDqSQ',
          role: 'Drums'
        },

        {
          artist: 'Dan Francia',
          year: '2019',
          title: 'Come Back To Life',
          label: 'Exploding In Sound',
          image: null,
          spotifyUrl: 'https://open.spotify.com/album/4bZlkYt3pKT90sEJSjm9s2?si=uflHN35gTyKlrNxdrqbTwQ',
          role: 'Drums (on 3 songs)'
        },

        {
          artist: 'Lost Boy ?',
          year: '2019',
          title: 'Ted Talks [single]',
          label: 'n/a',
          image: null,
          spotifyUrl: 'https://open.spotify.com/album/5x9T2hdJXPtsxKG4BLzFxg?si=VOGGzYV3SICXr6XyO4RoDw',
          role: 'Drums'
        },

        {
          artist: 'Lost Boy ?',
          year: '2020',
          title: 'Feel Like Shit (All of the Time) [single]',
          label: 'n/a',
          image: null,
          spotifyUrl: 'https://open.spotify.com/album/37svXQvw1SIp0fU9frMnjP?si=dgR5yroCTCq4KhDR-conlg',
          role: 'Drums'
        },

        {
          artist: 'Dan Francia',
          year: '2020',
          title: 'Dust',
          label: 'Shea Stadium Records',
          image: null,
          spotifyUrl: 'https://open.spotify.com/album/6iHGMV4nBTBKT5dzs9G9k9?si=-yDQ-ErrTRmJNR9_zqNrFQ',
          role: 'Auxiliary Percussion, Melodica, Voice'
        }
      ]
    }
  }
})
