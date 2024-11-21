import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Image } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LineChart } from 'react-native-chart-kit';
import { getUrl } from '../_GlobalStateContext';

// Function to get the suffix for the day (st, nd, rd, th)
const getDaySuffix = (day: any) => {
  if (day > 3 && day < 21) return 'th'; // Handle 11th, 12th, 13th etc.
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const getFormattedDate = () => {
  const now = new Date();

  // Get day of the month
  const day = now.getDate();

  // Get month name (full)
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = monthNames[now.getMonth()];

  // Get year
  const year = now.getFullYear();

  // Get day suffix (st, nd, rd, th)
  const dayWithSuffix = day + getDaySuffix(day);

  // Return the formatted date string
  return `${dayWithSuffix} of ${month} ${year}`;
};


export default function TabTwoScreen() {
  const [data1, setData1] = useState({ temperatures: [], humidity: [], ppm: [], time: [] });
  const [data2, setData2] = useState({ temperatures: [], humidity: [], ppm: [], moisture: [], time: [] });
  const url = getUrl();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null); // Explicitly type the state

  // Function to fetch data
  const fetchData = async () => {
    setLoading(true); // Show loading indicator while fetching
    setError(null); // Reset error state

    console.log('----------------');
    try {
      const response1 = await fetch(url+'/get_ext_data', { cache: 'no-store' }); // Replace with your API URL
      const response2 = await fetch(url+'/get_int_data', { cache: 'no-store' }); // Replace with your API URL
      console.log('url:', response1);
      console.log('url:', response2);
      if (!response1.ok) {
        throw new Error(`Server responded with status ${response1.status}`);
      }
      if (!response2.ok) {
        throw new Error(`Server responded with status ${response2.status}`);
      }
      const result1 = await response1.text();
      const result2 = await response2.text();
      var rawText1 = result1.trim(); // Remove leading/trailing whitespace
      console.log("Raw Data:", rawText1);

      // Ensure the JSON is properly closed with '}'
      if (!rawText1.endsWith('}')) {
        console.warn("Raw data is incomplete; fixing JSON format...");
        rawText1 += '}'; // Append '}' to fix malformed JSON
      }

      const parsedJson1 = JSON.parse(rawText1); // Parse the fixed JSON

      
      var rawText2 = result2.trim(); // Remove leading/trailing whitespace
      console.log("Raw Data:", rawText2);

      // Ensure the JSON is properly closed with '}'
      if (!rawText2.endsWith('}')) {
        console.warn("Raw data is incomplete; fixing JSON format...");
        rawText2 += '}'; // Append '}' to fix malformed JSON
      }

      const parsedJson2 = JSON.parse(rawText2); // Parse the fixed JSON

      setData1(parsedJson1);
      setData2(parsedJson2);
      
      console.log('url:', url+'/get_ext_data')
      console.log('url2:', url+'/get_int_data')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false); // Hide loading indicator
      setRefreshing(false); // Stop pull-to-refresh spinner
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };


  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading ? (
            <ParallaxScrollView
                    headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                    headerImage={
                      <Image
                        source={require('@/assets/images/Greenhouse_Software.jpg')}
                        style={styles.Logo}
                      />
                    }>
                    <ThemedView style={styles.titleContainer}>
                      <ThemedText type="title">Monitor</ThemedText>
                    </ThemedView>
                    <ThemedText>{getFormattedDate()}</ThemedText>

                <View style={styles.loadingContainer}>
                  <ThemedText>Loading...</ThemedText>
                </View>
            </ParallaxScrollView>
      ) : error ? (
        <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={
                    <Image
                    source={require('@/assets/images/Greenhouse_Software.jpg')}
                    style={styles.Logo}
                  />
                }>
                <ThemedView style={styles.titleContainer}>
                  <ThemedText type="title">Monitor</ThemedText>
                </ThemedView>
                <ThemedText>{getFormattedDate()}</ThemedText>
                
                <ThemedView style={styles.errorContainer}>
                  <Text style={styles.errorText}>Error: {error}</Text>
                </ThemedView>
        </ParallaxScrollView>
      ) : (
        <>


    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
          <Image
          source={require('@/assets/images/Greenhouse_Software.jpg')}
          style={styles.Logo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Monitor</ThemedText>
      </ThemedView>
      <ThemedText>{getFormattedDate()}</ThemedText>


      <Collapsible title="Interior Gateway">
        <ThemedText style={styles.header}>Temperature</ThemedText>
        <ScrollView horizontal>
          <LineChart
            key={`temperature-${data2.temperatures.join('-')}`} // Force re-render
            data={{
              labels: data2.time.slice(0, 50), // Use full time array for scrollable chart
              datasets: [
                {
                  data: data2.temperatures,
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red color
                  strokeWidth: 2,
                },
              ],
            }}
            width={4000} // Extend width to allow horizontal scrolling
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </ScrollView>

        {/* Humidity Chart */}
        <ThemedText style={styles.header}>Humidity</ThemedText>
        <ScrollView horizontal>
          <LineChart
            key={`humidity-${data2.humidity.join('-')}`} // Force re-render
            data={{
              labels: data2.time.slice(0, 50), // Use full time array for scrollable chart
              datasets: [
                {
                  data: data2.humidity,
                  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue color
                  strokeWidth: 2,
                },
              ],
            }}
            width={4000} // Extend width to allow horizontal scrolling
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </ScrollView>

        {/* ppm Chart */}
        <ThemedText style={styles.header}>PPM</ThemedText>
        <ScrollView horizontal>
          <LineChart
            key={`ppm-${data2.ppm.join('-')}`} // Force re-render
            data={{
              labels: data2.time.slice(0, 50), // Use full time array for scrollable chart
              datasets: [
                {
                  data: data2.ppm,
                  color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // Blue color
                  strokeWidth: 2,
                },
              ],
            }}
            width={4000} // Extend width to allow horizontal scrolling
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </ScrollView>

        {/* ppm Chart */}
        <ThemedText style={styles.header}>Soil Moisture</ThemedText>
        <ScrollView horizontal>
          <LineChart
            key={`Moisture-${data2.moisture.join('-')}`} // Force re-render
            data={{
              labels: data2.time.slice(0, 50), // Use full time array for scrollable chart
              datasets: [
                {
                  data: data2.moisture,
                  color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // Blue color
                  strokeWidth: 2,
                },
              ],
            }}
            width={4000} // Extend width to allow horizontal scrolling
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </ScrollView>
      </Collapsible>


      
      <Collapsible title="Exterior Gateway">
        <ThemedText style={styles.header}>Temperature</ThemedText>
        <ScrollView horizontal>
          <LineChart
            key={`temperature-${data1.temperatures.join('-')}`} // Force re-render
            data={{
              labels: data1.time.slice(0, 50), // Use full time array for scrollable chart
              datasets: [
                {
                  data: data1.temperatures,
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red color
                  strokeWidth: 2,
                },
              ],
            }}
            width={4000} // Extend width to allow horizontal scrolling
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </ScrollView>

        {/* Humidity Chart */}
        <ThemedText style={styles.header}>Humidity</ThemedText>
        <ScrollView horizontal>
          <LineChart
            key={`humidity-${data1.humidity.join('-')}`} // Force re-render
            data={{
              labels: data1.time.slice(0, 50), // Use full time array for scrollable chart
              datasets: [
                {
                  data: data1.humidity,
                  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue color
                  strokeWidth: 2,
                },
              ],
            }}
            width={4000} // Extend width to allow horizontal scrolling
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </ScrollView>

        {/* ppm Chart */}
        <ThemedText style={styles.header}>PPM</ThemedText>
        <ScrollView horizontal>
          <LineChart
            key={`ppm-${data1.ppm.join('-')}`} // Force re-render
            data={{
              labels: data1.time.slice(0, 50), // Use full time array for scrollable chart
              datasets: [
                {
                  data: data1.ppm,
                  color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // Blue color
                  strokeWidth: 2,
                },
              ],
            }}
            width={4000} // Extend width to allow horizontal scrolling
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </ScrollView>
      </Collapsible>


    </ParallaxScrollView>

    
    </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    flex: 1,
    padding: 0,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  Logo: {
    height: 298,
    width: 390,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});



const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 1, // Optional, specify the number of decimal places
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};