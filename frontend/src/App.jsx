import { useState } from 'react'
import './App.css'

function App() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleTrack() {
    if (!trackingNumber.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/track?tracking_number=${trackingNumber}`
)
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Find the index of the current (most recent, done) step
  const currentIndex = result?.steps
    ? result.steps.reduce((acc, step, i) => (step.done ? i : acc), -1)
    : -1

  return (
    <>
      <nav>
        <div className="logo">Caseily</div>
        <div className="navlinks">
          <a href="#">Shop</a>
          <a href="#">Wholesale</a>
          <a href="#" className="active">Track order</a>
          <a href="#">Contact</a>
        </div>
      </nav>

      <div className="hero">
        <div className="eyebrow">Order tracking</div>
        <h1>Where's your order?</h1>
        <p>Enter your tracking number below to see live delivery status — no matter which courier is carrying it.</p>
      </div>

      <div className="wrap">
        <div className="lookup">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number, e.g. CX051903781IN"
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
          />
          <button onClick={handleTrack} disabled={loading}>
            {loading ? 'Tracking...' : 'Track order'}
          </button>
        </div>

        {error && <p className="status-text error">{error}</p>}

        {result && (
          <div className="result">
            <div className="result-head">
              <div className="oid">Tracking number</div>
              <h2>{trackingNumber}</h2>
              <div className="status-pill">
                <span className="dot"></span>
                {result.status}
              </div>
            </div>

            <div className="timeline">
              {result.steps?.map((step, i) => (
                <div
                  key={i}
                  className={`step ${step.done ? '' : 'pending'} ${i === currentIndex ? 'current' : ''}`}
                >
                  <h3>{step.label}</h3>
                  <p>{step.timestamp ? step.timestamp : 'Pending'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer>© Caseily · Shipping · Returns · Contact · Wholesale</footer>
    </>
  )
}

export default App