'use client';

import styles from './AssetShockCard.module.css';

interface AssetShockCardProps {
  assetValue: number;    // 억원
  expectedExtra: number; // 억원
  riskGrade: string;
}

const RISK_COLOR: Record<string, string> = {
  R1: '#16a34a',
  R2: '#d97706',
  R3: '#e63946',
  R4: '#b91c1c',
};

const COST_INCREASE_RATE = 0.1; // 10% stress scenario

export default function AssetShockCard({ assetValue, expectedExtra, riskGrade }: AssetShockCardProps) {
  const stressExtra    = Math.round(expectedExtra * (1 + COST_INCREASE_RATE) * 100) / 100;
  const projectedAsset = Math.round((assetValue - stressExtra) * 100) / 100;
  const assetLoss      = Math.round((assetValue - projectedAsset) * 100) / 100;
  const lossRatio      = assetValue > 0 ? ((assetLoss / assetValue) * 100).toFixed(1) : '0.0';
  const accentColor    = RISK_COLOR[riskGrade] ?? '#e63946';

  return (
    <div className={styles.card}>
      <p className={styles.label}>공사비 10% 상승 시 자산 충격 시뮬레이션</p>

      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.itemLabel}>현재 자산</span>
          <span className={styles.itemValue}>{assetValue}억원</span>
        </div>
        <div className={styles.item}>
          <span className={styles.itemLabel}>예상 추가 분담금</span>
          <span className={styles.itemValue} style={{ color: accentColor }}>
            +{stressExtra}억원
          </span>
        </div>
        <div className={styles.item}>
          <span className={styles.itemLabel}>사업 완료 후 예상 자산</span>
          <span
            className={styles.itemValue}
            style={{ color: projectedAsset < 0 ? '#b91c1c' : '#0f172a' }}
          >
            {projectedAsset}억원
          </span>
        </div>
      </div>

      <div className={styles.lossRow} style={{ borderColor: accentColor + '33' }}>
        <span className={styles.lossLabel}>예상 자산 감소</span>
        <span className={styles.lossValue} style={{ color: accentColor }}>
          -{assetLoss}억원 ({lossRatio}%)
        </span>
      </div>
    </div>
  );
}
