"use client";

import { useState } from "react";
import { FiFilter } from "react-icons/fi";

export default function LocationFilter() {
  const [distance, setDistance] = useState("5");
  const [price, setPrice] = useState("all");
  const [group, setGroup] = useState("1");

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 font-medium">
        <FiFilter />
        Filter
      </div>

      <select
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
        className="rounded-xl border px-3 py-2"
      >
        <option value="1">1 km</option>
        <option value="3">3 km</option>
        <option value="5">5 km</option>
        <option value="10">10 km</option>
      </select>

      <select
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="rounded-xl border px-3 py-2"
      >
        <option value="all">All Prices</option>
        <option value="$">$</option>
        <option value="$$">$$</option>
        <option value="$$$">$$$</option>
      </select>

      <select
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        className="rounded-xl border px-3 py-2"
      >
        <option value="1">1 Person</option>
        <option value="2">2 People</option>
        <option value="4">3-4 People</option>
        <option value="6">5+ People</option>
      </select>
    </div>
  );
}
