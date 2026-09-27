export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 14 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
