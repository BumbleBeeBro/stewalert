import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, FlatList, ActivityIndicator} from 'react-native';
import Constants from 'expo-constants';
import * as startup from "./components/startup";
import * as WebBrowser from 'expo-web-browser';
import Moment from 'moment';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: Constants.statusBarHeight,
		justifyContent: 'center',
		alignItems: 'center',
		marginHorizontal: 16,
		marginBottom: 10,
	},
	title: {
		fontSize: 30,
		textAlign: 'center',
		margin: 10,

	},
	wait: {
		flex: 1,
		padding: 20,
		margin: 40
	},
	item: {
		padding: 10,
		fontSize: 18,
		height: 44,
	},
	button: {
		flex: 1,
		margin: 10,
		padding: 10,
		width: "40%",
	},
	fixToText: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
	}
});

export default class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			stews: [],
		};
	}

	async componentDidMount() {

		const stews = await this.getStews();

		this.setState({
			isLoading: false,
			stews,
		});
	}
		render() {
			Moment.locale('en');
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Die nächsten Eintöpfe gibt es am:</Text>
					{this.state.isLoading ? <ActivityIndicator style={styles.wait}/> : 
						<FlatList data={this.state.stews} keyExtractor={item => item.datestring} renderItem={({ item }) => <Text style={styles.item}> {this.getRelativeDay(item.date)} ({item.datestring}) </Text>}/>
					}
					
					<View style={styles.fixToText} >
						<Button style={styles.button}
						onPress={startup.default}
						title="Aktiviere Benachrichtigung"
						color="#C1FFA6"
					/>
					<Button style={styles.button}
						onPress={this.openDaVinci}
						title="Speiseplan"
						color="#C1FFA6"
					/>
					</View>
				</View>
			);
		}

	async getStews () {
		const response = await fetch('https://stew.felixhummel.me/stews', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return response.json();
	}

	getRelativeDay(date) {

		const currentDate = new Date().getTime();

		const days = Math.round((date - currentDate) / (1000 * 3600 * 24));

		if (days <= 0) {
			return "Heute"
		} else {

			return "In " + days + " Tagen"
		}
	}

	async openDaVinci() {
		await WebBrowser.openBrowserAsync('https://www.stw-muenster.de/de/essen-trinken/mensen/da-vinci/#speiseplan');
	}

	}




