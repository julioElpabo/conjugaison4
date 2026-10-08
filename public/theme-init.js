(function () {
  try {
    var remember = document.cookie.split(';').find(function (part) {
      return part.trim().indexOf('tatitotu_remember_preferences=') === 0
    })
    if (remember) {
      try {
        remember = JSON.parse(decodeURIComponent(remember.slice(remember.indexOf('=') + 1)))
      } catch (_) {
        remember = null
      }
    }
    if (remember === 'disabled') {
      document.documentElement.dataset.theme = 'light'
      document.documentElement.style.colorScheme = 'light'
      document.documentElement.dataset.falcMode = 'false'
      return
    }
    var theme = localStorage.getItem('conjugaison.theme')
    if (theme !== 'light' && theme !== 'dark') theme = 'light'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.documentElement.dataset.falcMode = localStorage.getItem('conjugaison.falc-mode') === 'true' ? 'true' : 'false'
  } catch (_) {
    // Le thème clair défini dans les feuilles de style reste le repli.
  }
})()
