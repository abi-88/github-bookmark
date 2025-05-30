import { useEffect, useRef } from 'react';
import type { BookmarkStats as BookmarkStatsType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { format } from 'date-fns';
import * as d3 from 'd3';

interface BookmarkStatsProps {
  stats: BookmarkStatsType[];
}

export function BookmarkStats({ stats }: BookmarkStatsProps) {

  const lineChartRef = useRef<SVGSVGElement>(null);

  // Prepare data for charts
  const prepareChartData = () => {
    if (!stats.length) return { filledStats: [], dateRange: [] };
    
    // Use the actual data points directly instead of filling in dates
    // This ensures we only show the exact dates provided in the stats
    const filledStats = [...stats].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Create a dateRange array with just the unique dates from stats
    const dateRange = filledStats.map(stat => new Date(stat.date));
    
    return { filledStats, dateRange };
  };
  

  
  // Render line chart
  useEffect(() => {
    if (!stats.length || !lineChartRef.current) return;
    
    const svgContainer = d3.select(lineChartRef.current);
    svgContainer.selectAll('*').remove();
    
    const { filledStats } = prepareChartData();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = lineChartRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const svg = svgContainer
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleTime()
      .domain(d3.extent(filledStats, d => new Date(d.date)) as [Date, Date])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(filledStats, d => d.count) || 1])
      .nice()
      .range([height, 0]);
    
    // Add X axis with exact dates from our data
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .tickValues(filledStats.map(d => new Date(d.date))) // Use only our actual dates
          .tickFormat((d: any) => format(d, 'MMM d'))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');
    
    // Create exactly 5 integer ticks for Y axis
    const maxValue = d3.max(filledStats, d => d.count) || 5;
    const tickValues = [0, 1, 2, 3, 4, 5].filter(v => v <= maxValue);
    if (tickValues.length < 5) {
      // If we have less than 5 values, generate evenly spaced integers up to max
      const step = Math.ceil(maxValue / 4); // 4 steps for 5 values (0 to max)
      tickValues.length = 0; // Clear the array
      for (let i = 0; i <= 4; i++) {
        tickValues.push(i * step);
      }
    }
    
    // Add Y axis with custom integer ticks
    svg.append('g')
      .call(d3.axisLeft(y)
        .tickValues(tickValues)
        .tickFormat((d: any) => d.toString())
      );
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Repositories');
    
    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .style('stroke-opacity', 0.1);
    
    // Create line generator
    const line = d3.line<BookmarkStatsType>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);
    
    // Add the line path
    svg.append('path')
      .datum(filledStats)
      .attr('fill', 'none')
      .attr('stroke', '#646cff')
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // Add dots for data points
    svg.selectAll('.dot')
      .data(filledStats.filter(d => d.count > 0))
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(new Date(d.date)))
      .attr('cy', d => y(d.count))
      .attr('r', 5)
      .attr('fill', '#646cff')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);
    
    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', '#1a1a1a')
      .style('color', 'white')
      .style('border-radius', '4px')
      .style('padding', '6px 10px')
      .style('opacity', 0)
      .style('pointer-events', 'none');
    
    // Add event handlers to dots
    svg.selectAll('.dot')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 7)
          .attr('stroke-width', 2);
        
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <strong>${format(new Date(d.date), 'MMM d, yyyy')}</strong><br/>
          ${d.count} repositories
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 5)
          .attr('stroke-width', 1.5);
        
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
    
    // Clean up on unmount
    return () => {
      tooltip.remove();
    };
  }, [stats]);

  return (
    <div className="space-y-6">
      <Card className='border-0 bg-[#1e1e1e]' style={{
              boxShadow: '0 0 4px 0px #646cff',
            }}>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Bookmark Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.length > 0 ? (
            <div className="w-full overflow-x-auto h-[350px]">
              <svg ref={lineChartRef} width="100%" height="350" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[350px] text-center">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#646cff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-400">No bookmark data yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Start bookmarking repositories to see your activity trends over time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
