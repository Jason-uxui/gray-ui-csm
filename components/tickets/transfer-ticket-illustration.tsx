import styles from "./transfer-ticket-illustration.module.css"

type TransferTicketIllustrationProps = {
  active?: boolean
}

/** Approved Figma illustration 2631:3415 + motion r03 (2643:3419).
 * Static SVG details retain their intrinsic Figma export dimensions.
 * Translation wrappers stay separate from the cards' resting rotations.
 */
export function TransferTicketIllustration({
  active = true,
}: TransferTicketIllustrationProps) {
  return (
    <div
      className={styles.illustration}
      aria-hidden="true"
      data-transfer-illustration
      data-active={active}
    >
      <div className={styles.shadow} data-motion-part="shadow" />
      <div className={styles.backMotion} data-motion-part="back-card">
        <div className={styles.backRotation}>
          <div className={styles.backDepth} />
          <div className={styles.backFace} />
        </div>
      </div>
      <div className={styles.frontMotion} data-motion-part="front-card">
        <div className={styles.frontRotation}>
          <div className={styles.frontDepth} />
          <div className={styles.frontFace} />
          <div className={styles.lines}>
            <div />
            <div />
            <div />
          </div>
          <div className={styles.badge} />
        </div>
      </div>
      <div className={styles.arrow} data-motion-part="arrow" />
    </div>
  )
}
