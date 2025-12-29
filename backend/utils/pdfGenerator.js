// PDF Generator using HTML to PDF conversion
// We'll use a simple approach with JSON data and let frontend handle PDF generation

export const generateUsersPDF = (users) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Users Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #d4af37; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Users Report</h1>
      <p>Generated on: ${new Date().toLocaleDateString('id-ID')}</p>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created Date</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>${user.role}</td>
              <td>${new Date(user.created_at).toLocaleDateString('id-ID')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Total Users: ${users.length}</p>
        <p>This is an automatically generated report.</p>
      </div>
    </body>
    </html>
  `
  return htmlContent
}

export const generateMenusPDF = (menus) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Menus Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #d4af37; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Menus Report</h1>
      <p>Generated on: ${new Date().toLocaleDateString('id-ID')}</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${menus.map(menu => `
            <tr>
              <td>${menu.name}</td>
              <td>${menu.category}</td>
              <td>Rp ${menu.price.toLocaleString('id-ID')}</td>
              <td>${menu.description || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Total Menus: ${menus.length}</p>
        <p>This is an automatically generated report.</p>
      </div>
    </body>
    </html>
  `
  return htmlContent
}

export const generateOrdersPDF = (orders, startDate = null, endDate = null) => {
  const dateRange = startDate && endDate 
    ? `from ${new Date(startDate).toLocaleDateString('id-ID')} to ${new Date(endDate).toLocaleDateString('id-ID')}`
    : 'All Orders'
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Orders Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        .date-range { text-align: center; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #d4af37; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-completed { background-color: #dcfce7; color: #166534; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Orders Report</h1>
      <div class="date-range">
        <p>Period: ${dateRange}</p>
        <p>Generated on: ${new Date().toLocaleDateString('id-ID')}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr>
              <td>#${order.id}</td>
              <td>${order.username}</td>
              <td>Rp ${order.total_price.toLocaleString('id-ID')}</td>
              <td><span class="status status-${order.status}">${order.status}</span></td>
              <td>${new Date(order.created_at).toLocaleDateString('id-ID')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="summary">
        <h3>Summary</h3>
        <p>Total Orders: ${orders.length}</p>
        <p>Total Revenue: Rp ${orders.reduce((sum, order) => sum + order.total_price, 0).toLocaleString('id-ID')}</p>
      </div>
      <div class="footer">
        <p>This is an automatically generated report.</p>
      </div>
    </body>
    </html>
  `
  return htmlContent
}
