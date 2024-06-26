(function ($) {
    "use strict";

    /* Sale statistics Chart */
    document.addEventListener('DOMContentLoaded', async () => {
        if (document.getElementById('myChart')) {
            try {
                const response = await fetch('/admin/orderChart'); 
                const data = await response.json();
                
                console.log(data.array); 

                var ctx = document.getElementById('myChart').getContext('2d');
                var chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [{
                            label: 'Delivered Products',
                            tension: 0.3,
                            fill: true,
                            backgroundColor: 'rgba(44, 120, 220, 0.2)',
                            borderColor: 'rgba(44, 120, 220)',
                            data: data.array
                        }]
                    },
                    options: {
                        plugins: {
                            legend: {
                                labels: {
                                    usePointStyle: true,
                                },
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        }

        /* Sale statistics Chart 2 */
        if ($('#myChart2').length) {
            var ctx = document.getElementById("myChart2");
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ["900", "1200", "1400", "1600"],
                    datasets: [
                        {
                            label: "US",
                            backgroundColor: "#5897fb",
                            barThickness: 10,
                            data: [233, 321, 783, 900]
                        },
                        {
                            label: "Europe",
                            backgroundColor: "#7bcf86",
                            barThickness: 10,
                            data: [408, 547, 675, 734]
                        },
                        {
                            label: "Asian",
                            backgroundColor: "#ff9076",
                            barThickness: 10,
                            data: [208, 447, 575, 634]
                        },
                        {
                            label: "Africa",
                            backgroundColor: "#d595e5",
                            barThickness: 10,
                            data: [123, 345, 122, 302]
                        },
                    ]
                },
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                usePointStyle: true,
                            },
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } // end if
    });
})(jQuery);
