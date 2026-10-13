import { useEffect, useState } from "react";
import "./App.css";

const API = "https://ai-smart-college-canteen-backend-1.onrender.com";

function App() {
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const recommendation =
  menu.length > 0
    ? menu.reduce((a, b) => (a.price < b.price ? a : b))
    : null;

  const loadData = async () => {
    try {
      const m = await fetch(`${API}/api/menu-items`);
      const o = await fetch(`${API}/api/orders`);

      setMenu(await m.json());
      setOrders(await o.json());
    } catch {
      console.log("Backend not connected");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addOrUpdateItem = async () => {
    if (!name || !price) return;

    const data = {
      name: name,
      price: Number(price),
      available: true,
    };

    await fetch(
      editId
        ? `${API}/api/menu-items/${editId}`
        : `${API}/api/menu-items`,
      {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    setName("");
    setPrice("");
    setEditId(null);
    loadData();
  };

  const editItem = (item) => {
    setEditId(item.id);
    setName(item.name);
    setPrice(item.price);
  };

  const deleteItem = async (id) => {
    await fetch(`${API}/api/menu-items/${id}`, {
      method: "DELETE",
    });

    loadData();
  };

  const placeOrder = async () => {
    if (!customerName || !orderAmount) return;

    await fetch(`${API}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerName: customerName,
        totalAmount: Number(orderAmount),
      }),
    });

    setCustomerName("");
    setOrderAmount("");
    loadData();
  };

  const updateStatus = async (id, status) => {
    await fetch(
      `${API}/api/orders/${id}?status=${status}`,
      {
        method: "PUT",
      }
    );

    loadData();
  };

  return (
    <div className="app">
      <header>
        <h1>🍴 AI Smart College Canteen</h1>
        <p>Smart • Fast • Easy Food Ordering</p>
      </header>

      <section className="card">
        <h2>{editId ? "Edit Menu Item" : "Add Menu Item"}</h2>

        <input
          placeholder="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button onClick={addOrUpdateItem}>
          {editId ? "Update Item" : "Add Item"}
        </button>

        {editId && (
          <button
            onClick={() => {
              setEditId(null);
              setName("");
              setPrice("");
            }}
          >
            Cancel
          </button>
        )}
      </section>
      {recommendation && (
  <section className="card">
    <h2>🤖 Smart Recommendation</h2>
    <p>
      We recommend <b>{recommendation.name}</b> — ₹{recommendation.price}
    </p>
    <p>💡 Affordable and available!</p>
  </section>
)}

      <section className="card">
        <h2>🍽️ Canteen Menu</h2>

        {menu.length === 0 ? (
          <p>No menu items yet.</p>
        ) : (
          menu.map((item) => (
            <div className="item" key={item.id}>
              <span>
                <b>{item.name}</b> — ₹{item.price}
              </span>

              <div>
                <button onClick={() => editItem(item)}>
                  Edit
                </button>

                <button onClick={() => deleteItem(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="card">
        <h2>🛒 Place Order</h2>

        <input
          placeholder="Customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <input
          placeholder="Total amount"
          type="number"
          value={orderAmount}
          onChange={(e) => setOrderAmount(e.target.value)}
        />

        <button onClick={placeOrder}>Place Order</button>
      </section>

      <section className="card">
        <h2>📦 Orders</h2>

        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div className="item" key={order.id}>
              <span>
                <b>{order.customerName}</b> — ₹{order.totalAmount}
                <br />
                Status: <b>{order.status}</b>
              </span>

              <select
                value={order.status}
                onChange={(e) =>
                  updateStatus(order.id, e.target.value)
                }
              >
                <option value="PENDING">PENDING</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;