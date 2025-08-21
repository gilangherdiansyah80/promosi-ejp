const DataTable = ({ data }) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  const headers = Object.keys(data[0]);

  const hargaFields = [
    "price",
    "unitPrice",
    "totalPrice",
    "itemSales",
    "harga",
    "hargaPromo",
    "total",
    "unit_price",
    "item_sales",
  ];

  const formatValue = (value, header) => {
    const headerLower = header.toLowerCase();
    if (hargaFields.includes(headerLower) && !isNaN(value)) {
      return `Rp${Number(value).toLocaleString("id-ID")}`;
    }
    if (typeof value === "number") {
      return value.toLocaleString("id-ID");
    }
    return Array.isArray(value) ? value.join(", ") : value;
  };

  return (
    <table className="min-w-full border border-gray-300 text-sm mb-4">
      <thead className="bg-gray-100">
        <tr>
          {headers.map((header) => (
            <th key={header} className="border p-2 text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border-t">
            {headers.map((header) => (
              <td key={header} className="border p-2">
                {formatValue(row[header], header)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
