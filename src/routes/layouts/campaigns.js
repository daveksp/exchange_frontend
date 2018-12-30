import React, { Component, Fragment } from "react";
import { injectIntl} from 'react-intl';
import {
  Row,
  Card,
  CustomInput,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ButtonDropdown,
  UncontrolledDropdown,
  Collapse,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Input,
  CardBody,
  CardSubtitle,
  CardImg,
  Label,
  CardText,
  Progress,
  Badge
} from "reactstrap";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import CustomSelectInput from "Components/CustomSelectInput";
import classnames from "classnames";

import IntlMessages from "Util/IntlMessages";
import { Colxx, Separator } from "Components/CustomBootstrap";

import Pagination from "Components/List/Pagination";
import mouseTrap from "react-mousetrap";

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
function collect(props) {
  return { data: props.data };
}
const apiUrl ="http://dkspinheiro.com/campaigns.json"
import axios from 'axios';

class CampaignsLayout extends Component {
    constructor(props) {
      super(props);
      this.toggleDisplayOptions = this.toggleDisplayOptions.bind(this);
      this.toggleSplit = this.toggleSplit.bind(this);
      this.dataListRender = this.dataListRender.bind(this);
      this.toggleModal = this.toggleModal.bind(this);
      this.getIndex = this.getIndex.bind(this);
      this.onContextMenuClick = this.onContextMenuClick.bind(this);


      this.state = {
        displayMode: "imagelist",
        pageSizes: [8, 12, 24],
        selectedPageSize: 8,
        categories:  [
          {label:'Cakes',value:'Cakes',key:0},
          {label:'Cupcakes',value:'Cupcakes',key:1},
          {label:'Desserts',value:'Desserts',key:2},
        ],
        orderOptions:[
          {column: "title",label: "Product Name"},
          {column: "category",label: "Category"},
          {column: "status",label: "Status"}
        ],
        selectedOrderOption:  {column: "title",label: "Product Name"},
        dropdownSplitOpen: false,
        modalOpen: false,
        currentPage: 1,
        totalItemCount: 0,
        totalPage: 1,
        search: "",
        selectedItems: [],
        lastChecked: null,
        displayOptionsIsOpen: false,
        isLoading:false
      };
    }
    componentWillMount() {
      this.props.bindShortcut(["ctrl+a", "command+a"], () =>
        this.handleChangeSelectAll(false)
      );
      this.props.bindShortcut(["ctrl+d", "command+d"], () => {
        this.setState({
          selectedItems: []
        });
        return false;
      });
    }

    toggleModal() {
      this.setState({
        modalOpen: !this.state.modalOpen
      });
    }
    toggleDisplayOptions() {
      this.setState({ displayOptionsIsOpen: !this.state.displayOptionsIsOpen });
    }
    toggleSplit() {
      this.setState(prevState => ({
        dropdownSplitOpen: !prevState.dropdownSplitOpen
      }));
    }
    changeOrderBy(column) {
      this.setState(
        {
          selectedOrderOption: this.state.orderOptions.find(
            x => x.column === column
          )
        },
        () => this.dataListRender()
      );
    }
    changePageSize(size) {
      this.setState(
        {
          selectedPageSize: size,
          currentPage: 1
        },
        () => this.dataListRender()
      );
    }
    changeDisplayMode(mode) {
      this.setState({
        displayMode: mode
      });
      return false;
    }
    onChangePage(page) {
      this.setState(
        {
          currentPage: page
        },
        () => this.dataListRender()
      );
    }

    handleKeyPress(e) {
      if (e.key === "Enter") {
        this.setState(
          {
            search: e.target.value.toLowerCase()
          },
          () => this.dataListRender()
        );
      }
    }

    handleCheckChange(event, id) {
      if (
        event.target.tagName == "A" ||
        (event.target.parentElement &&
          event.target.parentElement.tagName == "A")
      ) {
        return true;
      }
      if (this.state.lastChecked == null) {
        this.setState({
          lastChecked: id
        });
      }

      let selectedItems = this.state.selectedItems;
      if (selectedItems.includes(id)) {
        selectedItems = selectedItems.filter(x => x !== id);
      } else {
        selectedItems.push(id);
      }
      this.setState({
        selectedItems
      });

      if (event.shiftKey) {
        var items = this.state.items;
        var start = this.getIndex(id, items, "id");
        var end = this.getIndex(this.state.lastChecked, items, "id");
        items = items.slice(Math.min(start, end), Math.max(start, end) + 1);
        selectedItems.push(
          ...items.map(item => {
            return item.id;
          })
        );
        selectedItems = Array.from(new Set(selectedItems));
        this.setState({
          selectedItems
        });
      }
      document.activeElement.blur();
    }

    getIndex(value, arr, prop) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][prop] === value) {
          return i;
        }
      }
      return -1;
    }
    handleChangeSelectAll(isToggle) {
      if (this.state.selectedItems.length >= this.state.items.length) {
        if (isToggle) {
          this.setState({
            selectedItems: []
          });
        }
      } else {
        this.setState({
          selectedItems: this.state.items.map(x => x.id)
        });
      }
      document.activeElement.blur();
      return false;
    }
    componentDidMount() {
      this.dataListRender();
    }

    dataListRender() {

      const {selectedPageSize,currentPage,selectedOrderOption,search} = this.state;
      axios.get(`${apiUrl}?pageSize=${selectedPageSize}&currentPage=${currentPage}&orderBy=${selectedOrderOption.column}&search=${search}`)
      .then(res => {
        return res.data        
      }).then(data=>{

        this.setState({
          totalPage: data.totalPage,
          items: data.data,
          selectedItems:[],
          totalItemCount : data.totalItem,
          isLoading:true
        });
      })
    }

    onContextMenuClick = (e, data, target) => {
      console.log("onContextMenuClick - selected items",this.state.selectedItems)
      console.log("onContextMenuClick - action : ", data.action);
    };

    onContextMenu = (e, data) => {
      const clickedProductId = data.data;
      if (!this.state.selectedItems.includes(clickedProductId)) {
        this.setState({
          selectedItems :[clickedProductId]
        });
      }

      return true;
    };

    render() {
      const startIndex= (this.state.currentPage-1)*this.state.selectedPageSize
      const endIndex= (this.state.currentPage)*this.state.selectedPageSize
      const {messages} = this.props.intl;
      return (
        !this.state.isLoading?
          <div className="loading"></div>
       :
        <Fragment>
          <div className="disable-text-selection">
            <Row>
              <Colxx xxs="12">
                <div className="mb-2">
                  <h1>
                    <IntlMessages id="menu.image-list" />
                  </h1>
                </div>

                <div className="mb-2">
                  <Button
                    color="empty"
                    className="pt-0 pl-0 d-inline-block d-md-none"
                    onClick={this.toggleDisplayOptions}
                  >
                    <IntlMessages id="layouts.display-options" />{" "}
                    <i className="simple-icon-arrow-down align-middle" />
                  </Button>
                  <Collapse
                    isOpen={this.state.displayOptionsIsOpen}
                    className="d-md-block"
                    id="displayOptions"
                  >
                    <div className="d-block d-md-inline-block">
                      <UncontrolledDropdown className="mr-1 float-md-left btn-group mb-1">
                        <DropdownToggle caret color="outline-dark" size="xs">
                          <IntlMessages id="layouts.orderby" />
                          {this.state.selectedOrderOption.label}
                        </DropdownToggle>
                        <DropdownMenu>
                          {this.state.orderOptions.map((order, index) => {
                            return (
                              <DropdownItem
                                key={index}
                                onClick={() => this.changeOrderBy(order.column)}
                              >
                                {order.label}
                              </DropdownItem>
                            );
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                      <div className="search-sm d-inline-block float-md-left mr-1 mb-1 align-top">
                        <input
                          type="text"
                          name="keyword"
                          id="search"
                          placeholder={messages["menu.search"]}
                          onKeyPress={e => this.handleKeyPress(e)}
                        />
                      </div>
                    </div>
                    <div className="float-md-right">
                      <span className="text-muted text-small mr-1">{`${startIndex}-${endIndex} of ${
                        this.state.totalItemCount
                      } `}</span>
                      <UncontrolledDropdown className="d-inline-block">
                        <DropdownToggle caret color="outline-dark" size="xs">
                          {this.state.selectedPageSize}
                        </DropdownToggle>
                        <DropdownMenu right>
                          {this.state.pageSizes.map((size, index) => {
                            return (
                              <DropdownItem
                                key={index}
                                onClick={() => this.changePageSize(size)}
                              >
                                {size}
                              </DropdownItem>
                            );
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>
                  </Collapse>
                </div>
                <Separator className="mb-5" />
              </Colxx>
            </Row>
            <Row>
              {this.state.items.map(product => {
                if (this.state.displayMode === "imagelist") {
                  return (
                    <Colxx
                      sm="6"
                      lg="4"
                      xl="3"
                      className="mb-3"
                      key={product.id}
                    >
                      <ContextMenuTrigger
                        id="menu_id"
                        data={product.id}
                        collect={collect}
                      >
                        <Card
                          onClick={event =>
                            this.handleCheckChange(event, product.id)
                          }
                          className={classnames({
                            active: this.state.selectedItems.includes(
                              product.id
                            )
                          })}
                        >
                          <div className="position-relative">
                            <NavLink
                              to={`?p=${product.id}`}
                              className="w-40 w-sm-100"
                            >
                              <CardImg
                                top
                                alt={product.title}
                                src={product.img}
                              />
                            </NavLink>
                            <Badge
                              color={product.statusColor}
                              pill
                              className="position-absolute badge-top-left"
                            >
                              {product.valuation}
                            </Badge>
                          </div>
                          <CardBody>
                            <Row>
                              <Colxx xxs="9" className="mb-3">
                                <CardSubtitle>{product.title}</CardSubtitle>
                                <CardText className="text-muted text-small mb-0 font-weight-light">
                                  {product.position}
                                </CardText>
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs="2" className="mb-8">
                                <img
                                  src={product.to_crest}
                                  alt="Notification"
                                  className="xsmall border-0 rounded-circle"
                                />
                              </Colxx>
                              <Colxx xxs="1" className="mb-8 transfer-sign-container">
                                <div class="transfers simple-icon-arrow-left-circle">
                                </div>
                              </Colxx>
                              <Colxx xxs="2" className="mb-8">
                                <img
                                  src={product.from_crest}
                                  alt="Notification"
                                  className="xsmall border-0 rounded-circle"
                                />
                              </Colxx>
                            </Row>
                          </CardBody>
                          <div className="position-relative">
                            <p className="mb-2">
                                <span className="float-right text-muted">
                                    {300}/{5000}
                                </span>
                            </p>
                            <Progress value={(300 / 5000) * 100} />
                          </div>
                        </Card>
                      </ContextMenuTrigger>
                    </Colxx>
                  );
                } else if (this.state.displayMode === "thumblist") {
                  return (
                    <Colxx xxs="12" key={product.id} className="mb-3">
                      <ContextMenuTrigger
                        id="menu_id"
                        data={product.id}
                        collect={collect}
                      >
                        <Card
                          onClick={event =>
                            this.handleCheckChange(event, product.id)
                          }
                          className={classnames("d-flex flex-row", {
                            active: this.state.selectedItems.includes(
                              product.id
                            )
                          })}
                        >
                          <NavLink
                            to={`?p=${product.id}`}
                            className="d-flex"
                          >
                            <img
                              alt={product.title}
                              src={product.img}
                              className="list-thumbnail responsive border-0"
                            />
                          </NavLink>
                          <div className="pl-2 d-flex flex-grow-1 min-width-zero">
                            <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                              <NavLink
                                to={`?p=${product.id}`}
                                className="w-40 w-sm-100"
                              >
                                <p className="list-item-heading mb-1 truncate">
                                  {product.title}
                                </p>
                              </NavLink>
                              <p className="mb-1 text-muted text-small w-15 w-sm-100">
                                {product.category}
                              </p>
                              <p className="mb-1 text-muted text-small w-15 w-sm-100">
                                {product.date}
                              </p>
                              <div className="w-15 w-sm-100">
                                <Badge color={product.statusColor} pill>
                                  {product.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                              <CustomInput
                                className="itemCheck mb-0"
                                type="checkbox"
                                id={`check_${product.id}`}
                                checked={this.state.selectedItems.includes(
                                  product.id
                                )}
                                onChange={() => {}}
                                label=""
                              />
                            </div>
                          </div>
                        </Card>
                      </ContextMenuTrigger>
                    </Colxx>
                  );
                } else {
                  return (
                    <Colxx xxs="12" key={product.id} className="mb-3">
                      <ContextMenuTrigger
                        id="menu_id"
                        data={product.id}
                        collect={collect}
                      >
                        <Card
                          onClick={event =>
                            this.handleCheckChange(event, product.id)
                          }
                          className={classnames("d-flex flex-row", {
                            active: this.state.selectedItems.includes(
                              product.id
                            )
                          })}
                        >
                          <div className="pl-2 d-flex flex-grow-1 min-width-zero">
                            <div className="card-body align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero align-items-lg-center">
                              <NavLink
                                to={`?p=${product.id}`}
                                className="w-40 w-sm-100"
                              >
                                <p className="list-item-heading mb-1 truncate">
                                  {product.title}
                                </p>
                              </NavLink>
                              <p className="mb-1 text-muted text-small w-15 w-sm-100">
                                {product.category}
                              </p>
                              <p className="mb-1 text-muted text-small w-15 w-sm-100">
                                {product.date}
                              </p>
                              <div className="w-15 w-sm-100">
                                <Badge color={product.statusColor} pill>
                                  {product.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                              <CustomInput
                                className="itemCheck mb-0"
                                type="checkbox"
                                id={`check_${product.id}`}
                                checked={this.state.selectedItems.includes(
                                  product.id
                                )}
                                onChange={() => {}}
                                label=""
                              />
                            </div>
                          </div>
                        </Card>
                      </ContextMenuTrigger>
                    </Colxx>
                  );
                }
              })}
              <Pagination
                currentPage={this.state.currentPage}
                totalPage={this.state.totalPage}
                onChangePage={i => this.onChangePage(i)}
              />
            </Row>
          </div>

          <ContextMenu
            id="menu_id"
            onShow={e => this.onContextMenu(e, e.detail.data)}
          >
            <MenuItem
              onClick={this.onContextMenuClick}
              data={{ action: "copy" }}
            >
              <i className="simple-icon-docs" /> <span>Copy</span>
            </MenuItem>
            <MenuItem
              onClick={this.onContextMenuClick}
              data={{ action: "move" }}
            >
              <i className="simple-icon-drawer" /> <span>Move to archive</span>
            </MenuItem>
            <MenuItem
              onClick={this.onContextMenuClick}
              data={{ action: "delete" }}
            >
              <i className="simple-icon-trash" /> <span>Delete</span>
            </MenuItem>
          </ContextMenu>
        </Fragment>
      );
    }
  }
  export default injectIntl(mouseTrap(CampaignsLayout))
