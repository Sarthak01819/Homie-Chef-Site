import { useEffect, useState } from "react";

const History = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/orders", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(setOrders);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 mt-20 bg-green-50/50 backdrop-blur-md rounded-2xl shadow-lg max-h-screen">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {orders.map(o => (
        <div key={o._id} className="border p-4 rounded-xl mb-3">
          <p>{o.items.join(", ")}</p>
          <p>{o.total}</p>
          <p className="text-green-600">{o.status}</p>
        </div>
      ))}
    </div>
  );
};

export default History;
