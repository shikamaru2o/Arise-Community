import React, { useEffect, useRef, useState } from "react";
import LanguageSelector from "./LanguageSelector";
import { useI18n } from "./i18n";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
const UPI_ID = import.meta.env.VITE_UPI_ID || "";
const UPI_QR_URL = import.meta.env.VITE_UPI_QR_URL || "";
const UPI_DISPLAY_NAME = import.meta.env.VITE_UPI_DISPLAY_NAME || "";
const UPI_INSTRUCTIONS = import.meta.env.VITE_UPI_INSTRUCTIONS || "";
const PHYSICAL_DETAILS = import.meta.env.VITE_PHYSICAL_DONATION_DETAILS || "";
const AMOUNTS = [500, 1000, 2500, 5000];

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function GivePage() {
  const { language, t } = useI18n();
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    document.title = `${t("give.title")} | ${t("brand")}`;
  }, [t, language]);

  const selectedAmount = customAmount ? Number(customAmount) : amount;

  const startPayment = async () => {
    if (submittingRef.current || status === "loading") return;
    if (!RAZORPAY_KEY_ID) {
      setStatus("error");
      setMessage(t("give.notConfigured"));
      return;
    }
    if (!Number.isInteger(selectedAmount) || selectedAmount < 100 || selectedAmount > 100000) {
      setStatus("error");
      setMessage(t("give.amountError"));
      return;
    }

    submittingRef.current = true;
    setStatus("loading");
    setMessage("");
    try {
      const orderResponse = await fetch(`${API_BASE}/donations/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || "Could not start donation.");
      if (!(await loadRazorpay())) throw new Error(t("give.checkoutError"));

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: t("brand"),
        description: t("give.checkoutDescription"),
        order_id: order.orderId,
        handler: async (response) => {
          const verifyResponse = await fetch(`${API_BASE}/donations/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verification = await verifyResponse.json();
          if (!verifyResponse.ok || !verification.success) throw new Error(verification.error || "Payment verification failed.");
          setPaymentId(verification.paymentId);
          setStatus("success");
        },
        modal: { ondismiss: () => { setStatus("idle"); setMessage(""); } },
        theme: { color: "#E3A857" },
      };
      new window.Razorpay(options).open();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || t("give.startError"));
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <main className="give-root">
      <GiveStyles />
      <div className="give-language"><LanguageSelector /></div>
      <Link to="/" className="give-home-button">{t("common.backHome")}</Link>
      <section className="give-intro">
        <span className="give-eyebrow">{t("give.eyebrow")}</span>
        <h1>{t("give.title")}</h1>
        <p>{t("give.intro")}</p>
      </section>
      <section className="give-methods" aria-label={t("give.methods")}>
        <article className="give-method">
          <span className="give-method-number">01</span>
          <h2>{t("give.online")}</h2>
          <p>{t("give.onlineText")}</p>
          <div className="give-amounts">
            {AMOUNTS.map((value) => <button className={amount === value && !customAmount ? "selected" : ""} key={value} type="button" onClick={() => { setAmount(value); setCustomAmount(""); }}>{`INR ${value.toLocaleString("en-IN")}`}</button>)}
          </div>
          <label className="give-custom-label">{t("give.custom")}<input min="100" max="100000" step="1" inputMode="numeric" type="number" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} placeholder="1000" /></label>
          <button className="give-button" type="button" onClick={startPayment} disabled={status === "loading"}>{status === "loading" ? t("give.opening") : t("give.payment")}</button>
          {status === "error" && <p className="give-error" role="alert">{message}</p>}
        </article>
        <article className="give-method">
          <span className="give-method-number">02</span>
          <h2>{t("give.upi")}</h2>
          {UPI_QR_URL ? <img className="give-qr" src={UPI_QR_URL} alt={t("give.qrAlt")} /> : <div className="give-placeholder">{t("give.qrPlaceholder")}</div>}
          <p>{UPI_ID ? (UPI_INSTRUCTIONS || t("give.qrText")) : t("give.qrText")}</p>
          <div className="give-detail"><strong>{UPI_DISPLAY_NAME || t("brand")}</strong>{UPI_ID ? <span>{UPI_ID}</span> : <span>{t("give.upiDetails")}</span>}</div>
        </article>
        <article className="give-method">
          <span className="give-method-number">03</span>
          <h2>{t("give.physical")}</h2>
          <p>{PHYSICAL_DETAILS || t("give.physicalText")}</p>
          <div className="give-placeholder give-physical">{t("give.physicalPlaceholder")}</div>
        </article>
      </section>
      {status === "success" && <section className="give-success" aria-live="polite"><h2>{t("give.success")}</h2><p>{t("give.verified")}</p><strong>{t("give.reference", { id: paymentId })}</strong></section>}
    </main>
  );
}

function GiveStyles() {
  return <style>{`
    .give-root { position: relative; min-height: 100vh; padding: 112px 6vw 70px; background: #1F1B2E; color: #F7F3EC; font-family: 'Work Sans', sans-serif; }
    .give-language { position: absolute; top: 24px; right: 6vw; }
    .give-home-button {
      position: absolute;
      top: 24px;
      left: 6vw;
      display: inline-flex;
      align-items: center;
      color: #A79FBF;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-decoration: none;
      border: 1px solid rgba(227,168,87,0.35);
      border-radius: 999px;
      padding: 8px 18px;
      transition: color 0.25s ease, border-color 0.25s ease;
    }
    .give-home-button:hover { color: #E3A857; border-color: #E3A857; }
    .give-intro { max-width: 720px; margin: 0 auto 58px; text-align: center; }
    .give-eyebrow, .give-method-number { color: #E3A857; font-size: 12px; font-weight: 500; letter-spacing: .18em; text-transform: uppercase; }
    .give-intro h1 { margin: 10px 0 14px; font: 500 58px/1 'Fraunces', serif; }
    .give-intro p, .give-method p { color: #A79FBF; line-height: 1.7; }
    .give-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; max-width: 1120px; margin: 0 auto; }
    .give-method { min-height: 390px; padding: 30px; background: #2A2440; border: 1px solid rgba(227,168,87,.25); border-radius: 8px; }
    .give-method h2 { margin: 10px 0 8px; font: 500 27px 'Fraunces', serif; }
    .give-amounts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 24px 0 14px; }
    .give-amounts button { padding: 10px 8px; border: 1px solid rgba(227,168,87,.35); border-radius: 3px; background: transparent; color: #F7F3EC; cursor: pointer; }
    .give-amounts button.selected, .give-amounts button:hover { background: #E3A857; color: #1F1B2E; }
    .give-custom-label { display: flex; flex-direction: column; gap: 6px; color: #A79FBF; font-size: 12px; }
    .give-custom-label input { padding: 10px; border: 1px solid rgba(255,255,255,.15); border-radius: 3px; background: rgba(255,255,255,.04); color: #F7F3EC; font: inherit; }
    .give-button { width: 100%; margin-top: 18px; padding: 13px; border: 1px solid #E3A857; border-radius: 2px; background: #E3A857; color: #1F1B2E; font-weight: 600; cursor: pointer; }
    .give-button:disabled { opacity: .6; cursor: not-allowed; }
    .give-error { color: #E0645A !important; font-size: 13px; }
    .give-qr { display: block; width: min(100%, 190px); aspect-ratio: 1; margin: 24px auto 18px; object-fit: contain; background: #F7F3EC; }
    .give-placeholder { display: grid; place-items: center; min-height: 190px; margin: 24px 0 18px; border: 1px dashed rgba(227,168,87,.45); color: #A79FBF; text-align: center; }
    .give-detail { display: flex; flex-direction: column; gap: 5px; padding-top: 8px; color: #E3A857; }
    .give-detail span { color: #F7F3EC; }
    .give-physical { min-height: 150px; padding: 20px; line-height: 1.6; }
    .give-success { max-width: 700px; margin: 34px auto 0; padding: 26px; border: 1px solid #E3A857; text-align: center; }
    .give-success h2 { margin: 0 0 8px; font: 500 26px 'Fraunces', serif; }
    .give-success p { color: #A79FBF; }
    @media (max-width: 820px) { .give-methods { grid-template-columns: 1fr; max-width: 620px; } .give-method { min-height: auto; } }
    @media (max-width: 520px) { .give-root { padding: 90px 6vw 45px; } .give-intro h1 { font-size: 46px; } .give-method { padding: 24px; } }
  `}</style>;
}
