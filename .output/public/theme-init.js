(function () {
  try {
    var theme = localStorage.getItem('conjugaison.theme')
    if (theme !== 'light' && theme !== 'dark') theme = 'light'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  } catch (_) {
    // Le thème clair défini dans les feuilles de style reste le repli.
  }
})()
