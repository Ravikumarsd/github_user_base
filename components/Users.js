import React, { Component } from "react";
import { View, FlatList, ActivityIndicator,ScrollView } from "react-native";
import { List, ListItem, SearchBar } from "react-native-elements";

export default class Users extends Component {
  state = {
    loading: false,
    data: [],
    page: 1,
    error: null,
    refreshing: false
  };
  searchFilterArray = [];
  componentDidMount() {
    this.makeRemoteRequest();
  }

  makeRemoteRequest = () => {
    const { page } = this.state;
    const url = `https://api.github.com/search/users?q=repos:%3E%3D1+location:Bangalore&page=${page}&per_page=10`;
    this.setState({ loading: true });
    fetch(url)
      .then(res => res.json())
      .then(res => {
        this.setState({
          data: page === 1 ? res.items : [...this.state.data, ...res.items],
          error: res.error || null,
          loading: false,
          refreshing: false
        });
        this.searchFilterArray = res.items;
      })
      .catch(error => {
        this.setState({ error, loading: false, refreshing: false });
      });
  };

  //pull to refresh
  handleRefresh = () => {
    this.setState(
      {
        page:1,
        refreshing: true
      },
      () => {
        this.makeRemoteRequest();
      }
    );
  };

  handleLoadMore = () => {
    this.setState(
      {
        page: this.state.page + 1
      },
      () => {
        this.makeRemoteRequest();
      }
    );
  };

  renderSeperator = () => {
    return (
      <View
        style={{
          height: 2,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };

  renderFooter = () => {
    return (
      <View
        style={{
          paddingTop: 10,
          paddingBottom: 20,
          borderTopColor: "#CED0E"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  renderHeader = () => {
    return (
      <SearchBar
        lightTheme
        placeholder="search"
        onChangeText={term => this.searchFilter(term)}
        autoCorrect={false}
      />
    );
  };

  searchFilter = text => {
    let newData = this.searchFilterArray.filter(item => {
      const itemData = item.login.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({ data: newData });
  };

  render() {
    return (
     <List containerStyle={{  borderTopWidth: 0, borderBottomWidth: 0 }}>
        <FlatList
          data={this.state.data}
          renderItem={({ item }) => (
            <ListItem
              containerStyle={{ borderBottomWidth: 0 }}
              roundAvatar
              title={item.login}
              subtitle={item.html_url}
              avatar={{ uri: item.avatar_url }}
            />
          )}
          keyExtractor={item => item.login}
          ItemSeparatorComponent={this.renderSeperator}
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={this.renderFooter}
          refreshing={this.state.refreshing}
          onRefresh={this.handleRefresh}
          onEndReached={this.handleLoadMore}
          onEndThreshold={0}
        />
      </List>
    );
  }
}
