(function () {
  try {
    var theme = localStorage.getItem('conjugaison.theme')
    if (theme !== 'light' && theme !== 'dark') theme = 'light'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.documentElement.dataset.falcMode = localStorage.getItem('conjugaison.falc-mode') === 'true' ? 'true' : 'false'
  } catch (_) {
    // Le thème clair défini dans les feuilles de style reste le repli.
  }
})()
