;; Wormhole Detection and Stabilization Management Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_WORMHOLE (err u101))
(define-constant ERR_INSUFFICIENT_FUNDS (err u102))

;; Data variables
(define-data-var wormhole-count uint u0)

;; Data maps
(define-map wormholes
  uint
  {
    discoverer: principal,
    coordinates: (string-ascii 64),
    status: (string-ascii 20),
    stability: uint
  }
)

(define-map stabilization-efforts
  uint
  {
    researcher: principal,
    wormhole-id: uint,
    stability-increase: uint,
    status: (string-ascii 20)
  }
)

;; Public functions
(define-public (report-wormhole (coordinates (string-ascii 64)))
  (let
    (
      (wormhole-id (+ (var-get wormhole-count) u1))
    )
    (map-set wormholes
      wormhole-id
      {
        discoverer: tx-sender,
        coordinates: coordinates,
        status: "unstable",
        stability: u0
      }
    )
    (var-set wormhole-count wormhole-id)
    (ok wormhole-id)
  )
)

(define-public (stabilize-wormhole (wormhole-id uint) (stability-increase uint))
  (let
    (
      (wormhole (unwrap! (map-get? wormholes wormhole-id) ERR_INVALID_WORMHOLE))
      (current-stability (get stability wormhole))
      (new-stability (+ current-stability stability-increase))
    )
    (map-set wormholes
      wormhole-id
      (merge wormhole {
        stability: new-stability,
        status: (if (>= new-stability u1000) "stable" "unstable")
      })
    )
    (map-set stabilization-efforts
      (var-get wormhole-count)
      {
        researcher: tx-sender,
        wormhole-id: wormhole-id,
        stability-increase: stability-increase,
        status: "completed"
      }
    )
    (ok new-stability)
  )
)

;; Read-only functions
(define-read-only (get-wormhole (wormhole-id uint))
  (map-get? wormholes wormhole-id)
)

(define-read-only (get-stabilization-effort (effort-id uint))
  (map-get? stabilization-efforts effort-id)
)

(define-read-only (get-wormhole-count)
  (var-get wormhole-count)
)

