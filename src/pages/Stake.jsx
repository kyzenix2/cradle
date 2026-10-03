import { useState } from "react";
import { useToast } from "../ui";

export default function Stake() {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  return (
    <div className="wrap" style={{ maxWidth: 760, paddingBlock: "32px 64px", display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">Staking</div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", margin: "8px 0 6px", letterSpacing: "-0.03em" }}>Stake $CRADLE, earn ETH</h1>
        <p className="muted" style={{ maxWidth: "60ch", margin: 0 }}>
          Cradle's 0.3% cut of every trade on every Cradle token goes to $CRADLE stakers, paid in ETH and shared by how much you stake. Unstaking takes 24 hours, and tokens stop earning as soon as you start.
        </p>
      </div>
      <div className="statline" style={{ margin: 0 }}>
        <span>
          <b>–</b> staked
        </span>
        <span>
          <b>–</b> paid to stakers
        </span>
        <span>
          <b>–</b> on its way
        </span>
        <span>
          <b>24h</b> unstake cooldown
        </span>
      </div>
      <div className="panel vault">
        <h3 style={{ margin: 0, fontSize: 15 }}>Stake</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input mono" inputMode="decimal" placeholder="0" aria-label="Amount to stake" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
          <button className="btn glow" type="button" onClick={() => toast("Connect a wallet holding $CRADLE to stake.")}>
            Stake
          </button>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          The first stake asks for two signatures: one to approve $CRADLE, one to stake. Unstaking tokens stop earning right away. Unstaking more while some are cooling restarts the timer for all of them. Claim your ETH any time.
        </p>
        <button className="btn block" type="button" onClick={() => toast("No wallet found. This preview does not connect a wallet.")}>
          Connect wallet
        </button>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          Connect a wallet holding $CRADLE to stake. Contract address is TBA.
        </p>
      </div>
    </div>
  );
}
