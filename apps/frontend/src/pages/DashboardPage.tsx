const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Ingredients" count={0} color="blue" />
        <DashboardCard title="Recipes" count={0} color="green" />
        <DashboardCard title="Planned Meals" count={0} color="purple" />
      </div>
    </div>
  )
}

const DashboardCard = ({ title, count, color }: { title: string; count: number; color: string }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>{count}</p>
    </div>
  )
}

export default DashboardPage
