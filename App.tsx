import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import XLSX from 'xlsx';
import { writeFile } from 'react-native-fs';
import { DocumentDirectoryPath } from 'react-native-fs';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';





const ROWS = 10;
const COLUMNS = 5;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,

  },
  downloadButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'column',

    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',

    // borderBottomWidth: 1,
    // borderBottomColor: 'black',
    // marginBottom: 10,
  },
  numberingCell: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    width: 40,
    marginRight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c1c1c1',
    textAlign: 'center',
  },
  inputCell: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    flex: 1,
    // marginRight: 5,
  },
});

const App = () => {
  const [gridData, setGridData] = useState(
    Array.from({ length: ROWS }, () => Array.from({ length: COLUMNS }, () => ''))
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const { getItem, setItem } = useAsyncStorage('gridData');

  useEffect(() => {
    // Load saved data from AsyncStorage
    loadGridData();
  }, []);

  useEffect(() => {
    // Save gridData to AsyncStorage whenever it changes
    saveGridData();
  }, [gridData]);

  const loadGridData = async () => {
    try {
      const data = await getItem();
      if (data !== null) {
        setGridData(JSON.parse(data));
        setIsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading grid data:', error);
    }
  };

  const saveGridData = async () => {
    try {
      await setItem(JSON.stringify(gridData));
    } catch (error) {
      console.error('Error saving grid data:', error);
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const updatedGridData = [...gridData];
    updatedGridData[rowIndex][colIndex] = value;
    setGridData(updatedGridData);
  };


  const handleDownload = async () => {
    const workbook = XLSX.utils.book_new();
    const sheetData = gridData.map((row) => [...row]);
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

    // Download the file
    const filePath = `${DocumentDirectoryPath}/spreadsheet.xlsx`;

    try {
      await writeFile(filePath, wbout, 'base64');
      Alert.alert('Downloaded', 'The spreadsheet has been downloaded.');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const renderGrid = () => {
    if (!isLoaded) {
      return null;
    }

    return (
      <View style={styles.gridContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.numberingCell}></Text>
          {[...Array(COLUMNS)].map((_, colIndex) => (
            <Text key={`header-${colIndex}`} style={styles.inputCell}>
              {String.fromCharCode(65 + colIndex)}
            </Text>
          ))}
        </View>
        {gridData.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.rowContainer}>
            <Text style={styles.numberingCell}>{rowIndex + 1}</Text>
            {row.map((cell, colIndex) => (
              <TextInput
                key={`cell-${rowIndex}-${colIndex}`}
                style={styles.inputCell}
                onChangeText={(text) => handleCellChange(rowIndex, colIndex, text)}
                value={cell}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
      </View>
      {renderGrid()}
    </View>
  );
};

export default App;