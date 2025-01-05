;; Wormhole NFT Contract

(define-non-fungible-token wormhole-nft uint)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_WORMHOLE (err u101))

;; Data variables
(define-data-var last-wormhole-id uint u0)

;; Data maps
(define-map wormhole-nft-data
  uint
  {
    discoverer: principal,
    coordinates: (string-ascii 64),
    discovery-date: uint,
    stability: uint,
    traversable: bool
  }
)

;; Public functions
(define-public (mint-wormhole-nft (coordinates (string-ascii 64)) (stability uint))
  (let
    (
      (wormhole-id (+ (var-get last-wormhole-id) u1))
    )
    (try! (nft-mint? wormhole-nft wormhole-id tx-sender))
    (map-set wormhole-nft-data
      wormhole-id
      {
        discoverer: tx-sender,
        coordinates: coordinates,
        discovery-date: block-height,
        stability: stability,
        traversable: false
      }
    )
    (var-set last-wormhole-id wormhole-id)
    (ok wormhole-id)
  )
)

(define-public (transfer-wormhole-nft (wormhole-id uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (unwrap! (nft-get-owner? wormhole-nft wormhole-id) ERR_INVALID_WORMHOLE)) ERR_NOT_AUTHORIZED)
    (try! (nft-transfer? wormhole-nft wormhole-id tx-sender recipient))
    (ok true)
  )
)

(define-public (update-wormhole-nft-status (wormhole-id uint) (new-stability uint) (is-traversable bool))
  (let
    (
      (wormhole-data (unwrap! (map-get? wormhole-nft-data wormhole-id) ERR_INVALID_WORMHOLE))
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ok (map-set wormhole-nft-data
      wormhole-id
      (merge wormhole-data {
        stability: new-stability,
        traversable: is-traversable
      })
    ))
  )
)

;; Read-only functions
(define-read-only (get-wormhole-nft-data (wormhole-id uint))
  (map-get? wormhole-nft-data wormhole-id)
)

(define-read-only (get-wormhole-nft-owner (wormhole-id uint))
  (nft-get-owner? wormhole-nft wormhole-id)
)

(define-read-only (get-last-wormhole-nft-id)
  (var-get last-wormhole-id)
)

