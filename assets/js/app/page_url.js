var errorUrl = ''

// TODO: replace with state obj in gallery
var galleryUserId = null

function _processUrl () {
  var url = location.pathname
  var street = _getStreet()

  // Remove heading slash
  if (!url) {
    url = '/'
  }
  url = url.substr(1)

  // Remove trailing slashes
  url = url.replace(/\/+$/, '')

  var urlParts = url.split(/\//)

  if (!url) {
    // Continue where we left off… or start with a default (demo) street

    setMode(MODES.CONTINUE)
  } else if ((urlParts.length == 1) && (urlParts[0] == URL_NEW_STREET)) {
    // New street

    setMode(MODES.NEW_STREET)
  } else if ((urlParts.length == 1) && (urlParts[0] == URL_NEW_STREET_COPY_LAST)) {
    // New street (but start with copying last street)

    setMode(MODES.NEW_STREET_COPY_LAST)
  } else if ((urlParts.length == 1) && (urlParts[0] == URL_JUST_SIGNED_IN)) {
    // Coming back from a successful sign in

    setMode(MODES.JUST_SIGNED_IN)
  } else if ((urlParts.length >= 1) && (urlParts[0] == URL_ERROR)) {
    // Error

    setMode(MODES.ERROR)
    errorUrl = urlParts[1]
  } else if ((urlParts.length == 1) && (urlParts[0] == URL_GLOBAL_GALLERY)) {
    // Global gallery

    setMode(MODES.GLOBAL_GALLERY)
  } else if ((urlParts.length == 1) && urlParts[0]) {
    // User gallery

    galleryUserId = urlParts[0]

    setMode(MODES.USER_GALLERY)
  } else if ((urlParts.length == 2) && (urlParts[0] == URL_HELP) && (urlParts[1] == URL_ABOUT)) {
    // About

    setMode(MODES.ABOUT)
  } else if ((urlParts.length == 2) && (urlParts[0] == URL_NO_USER) && urlParts[1]) {
    // TODO add is integer urlParts[1]
    // Existing street by an anonymous person

    street.creatorId = null
    street.namespacedId = urlParts[1]

    setMode(MODES.EXISTING_STREET)
  } else if ((urlParts.length >= 2) && urlParts[0] && urlParts[1]) {
    // TODO add is integer urlParts[1]
    // Existing street by a signed in person

    street.creatorId = urlParts[0]

    if (street.creatorId.charAt(0) == URL_RESERVED_PREFIX) {
      street.creatorId = street.creatorId.substr(1)
    }

    street.namespacedId = urlParts[1]

    setMode(MODES.EXISTING_STREET)
  } else {
    setMode(MODES.NOT_FOUND)
  }
}

function _updatePageUrl (forceGalleryUrl) {
  if (forceGalleryUrl) {
    var slug = galleryUserId || 'gallery/'
    var url = '/' + slug
  } else {
    var url = _getStreetUrl(_getStreet())
  }

  if (debug.hoverPolygon) {
    // TODO const
    url += '&debug-hover-polygon'
  }
  if (debug.canvasRectangles) {
    // TODO const
    url += '&debug-canvas-rectangles'
  }
  if (debug.forceLeftHandTraffic) {
    url += '&debug-force-left-hand-traffic'
  }
  if (debug.forceMetric) {
    url += '&debug-force-metric'
  }
  if (debug.forceUnsupportedBrowser) {
    url += '&debug-force-unsupported-browser'
  }
  if (debug.forceNonRetina) {
    url += '&debug-force-non-retina'
  }
  if (debug.secretSegments) {
    url += '&debug-secret-segments'
  }
  if (debug.forceReadOnly) {
    url += '&debug-force-read-only'
  }
  if (debug.forceTouch) {
    url += '&debug-force-touch'
  }
  if (debug.forceLiveUpdate) {
    url += '&debug-force-live-update'
  }
  if (debug.forceNoInternet) {
    url += '&debug-force-no-internet'
  }
  if (debug.experimental) {
    url += '&debug-experimental'
  }

  url = url.replace(/\&/, '?')

  window.history.replaceState(null, null, url)

  shareMenu.update()
}
