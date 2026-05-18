import axios from 'axios';

// Usamos QuickChart (basado en Chart.js) para renderizar imágenes de las gráficas sin requerir compilación de C++ (node-canvas) en Windows.
const fetchChart = async (chartConfig) => {
  try {
    const response = await axios.post(
      'https://quickchart.io/chart',
      {
        version: '4', // Usar sintaxis moderna de Chart.js v4
        width: 600,
        height: 400,
        backgroundColor: 'white',
        format: 'png',
        chart: chartConfig,
      },
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error generando gráfica con QuickChart:', error.message);
    throw error;
  }
};

export const generateDoughnutChart = async (labels, data, title) => {
  const configuration = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f', '#3498db', '#9b59b6', '#e67e22', '#1abc9c']
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: title, font: { size: 24 } },
        legend: { position: 'right', labels: { font: { size: 14 } } }
      }
    }
  };
  return await fetchChart(configuration);
};

export const generateBarChart = async (labels, data, title, labelTitle, backgroundColor = '#3498db') => {
  const configuration = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: labelTitle,
        data,
        backgroundColor
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: title, font: { size: 24 } },
        legend: { labels: { font: { size: 14 } } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 14 } } },
        x: { ticks: { font: { size: 14 } } }
      }
    }
  };
  return await fetchChart(configuration);
};

export const generateLineChart = async (labels, data, title, labelTitle) => {
  const configuration = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: labelTitle,
        data,
        borderColor: '#8e44ad',
        backgroundColor: 'rgba(142, 68, 173, 0.2)',
        fill: true,
        tension: 0.2,
        borderWidth: 3
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: title, font: { size: 24 } },
        legend: { labels: { font: { size: 14 } } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 14 } } },
        x: { ticks: { font: { size: 14 } } }
      }
    }
  };
  return await fetchChart(configuration);
};
