# perf2csv

Combine performance files from browser to one csv file.  

## Install
```sh
npm install perf2csv -g
```

## Usage

### Step 1

Open the website to measure it's performance in browser Chrome or Firefox.

### Step 2

Hit F12, to open the DevTools.
In the console of Chrome, run JSON.stringify(performance.getEntries()), then save the result as one log file in one folder.

In the console of Firefox, run JSON.stringify(performance.getEntries()), then save the result as one txt file in one folder.

### Step 3

Repeat Step 2 for more times to get the average of the performance.

### Step 4

Go to the above folder with *.log or *.txt file, then run the following, to get CombinedPerfEntries.csv

```sh
perf2csv
```


