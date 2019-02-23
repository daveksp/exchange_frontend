import React, { Component } from "react";
import ReactDOM from "react-dom";
import IntlMessages from "Util/IntlMessages";
import { Nav, NavItem } from "reactstrap";
import { NavLink } from "react-router-dom";
import classnames from "classnames";
import PerfectScrollbar from "react-perfect-scrollbar";
import { withRouter } from "react-router-dom";

import { connect } from "react-redux";
import {
  setContainerClassnames,
  addContainerClassname,
  changeDefaultClassnames
} from "Redux/actions";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.addEvents = this.addEvents.bind(this);
    this.removeEvents = this.removeEvents.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.toggle = this.toggle.bind(this);
    this.handleProps = this.handleProps.bind(this);
    this.getContainer = this.getContainer.bind(this);
    this.getMenuClassesForResize = this.getMenuClassesForResize.bind(this);
    this.setSelectedLiActive = this.setSelectedLiActive.bind(this);

    this.state = {
      selectedParentMenu: "",
      viewingParentMenu:"",
    };
  }

  handleWindowResize(event) {
    if (event && !event.isTrusted) {
      return;
    }
    const { containerClassnames } = this.props;
    let nextClasses = this.getMenuClassesForResize(containerClassnames);
    this.props.setContainerClassnames(0, nextClasses.join(" "));
  }

  handleDocumentClick(e) {
    const container = this.getContainer();
    let isMenuClick = false;
    if (
      e.target &&
      e.target.classList &&
      (e.target.classList.contains("menu-button") ||
        e.target.classList.contains("menu-button-mobile"))
    ) {
      isMenuClick = true;
    } else if (
      e.target.parentElement &&
      e.target.parentElement.classList &&
      (e.target.parentElement.classList.contains("menu-button") ||
        e.target.parentElement.classList.contains("menu-button-mobile"))
    ) {
      isMenuClick = true;
    } else if (
      e.target.parentElement &&
      e.target.parentElement.parentElement &&
      e.target.parentElement.parentElement.classList &&
      (e.target.parentElement.parentElement.classList.contains("menu-button") ||
        e.target.parentElement.parentElement.classList.contains(
          "menu-button-mobile"
        ))
    ) {
      isMenuClick = true;
    }
    if (
      (container.contains(e.target) || container === e.target) ||
      isMenuClick
    ) {
      return;
    }
    this.toggle(e);
    this.setState({
      viewingParentMenu:""
    })
  }

  getMenuClassesForResize(classes) {
    const { menuHiddenBreakpoint, subHiddenBreakpoint } = this.props;
    let nextClasses = classes.split(" ").filter(x => x != "");
    const windowWidth = window.innerWidth;
    if (windowWidth < menuHiddenBreakpoint) {
      nextClasses.push("menu-mobile");
    } else if (windowWidth < subHiddenBreakpoint) {
      nextClasses = nextClasses.filter(x => x != "menu-mobile");
      if (
        nextClasses.includes("menu-default") &&
        !nextClasses.includes("menu-sub-hidden")
      ) {
        nextClasses.push("menu-sub-hidden");
      }
    } else {
      nextClasses = nextClasses.filter(x => x != "menu-mobile");
      if (
        nextClasses.includes("menu-default") &&
        nextClasses.includes("menu-sub-hidden")
      ) {
        nextClasses = nextClasses.filter(x => x != "menu-sub-hidden");
      }
    }
    return nextClasses;
  }

  getContainer() {
    return ReactDOM.findDOMNode(this);
  }

  toggle() {
    const { containerClassnames, menuClickCount } = this.props;
    const currentClasses = containerClassnames
      ? containerClassnames.split(" ").filter(x => x != "")
      : "";

    if (currentClasses.includes("menu-sub-hidden") && menuClickCount == 3) {
      this.props.setContainerClassnames(2, containerClassnames);
    } else if (
      currentClasses.includes("menu-hidden") ||
      currentClasses.includes("menu-mobile")
    ) {
      this.props.setContainerClassnames(0, containerClassnames);
    }
  }

  handleProps() {
    this.addEvents();
  }

  addEvents() {
    ["click", "touchstart"].forEach(event =>
      document.addEventListener(event, this.handleDocumentClick, true)
    );
  }
  removeEvents() {
    ["click", "touchstart"].forEach(event =>
      document.removeEventListener(event, this.handleDocumentClick, true)
    );
  }
  setSelectedLiActive() {
    const oldli = document.querySelector(".sub-menu  li.active");
    if (oldli != null) {
      oldli.classList.remove("active");
    }

    /* set selected parent menu */
    const selectedlink = document.querySelector(".sub-menu  a.active");
    if (selectedlink != null) {
      selectedlink.parentElement.classList.add("active");
      this.setState({
        selectedParentMenu: selectedlink.parentElement.parentElement.getAttribute(
          "data-parent"
        )
      });
    }else{
      var selectedParentNoSubItem = document.querySelector(".main-menu  li a.active");
      if(selectedParentNoSubItem!=null){
        this.setState({
          selectedParentMenu: selectedParentNoSubItem.getAttribute(
            "data-flag"
          )
        });
      }else if (this.state.selectedParentMenu == "") {
        this.setState({
          selectedParentMenu: "dashboards"
        });
      }

    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.setSelectedLiActive();
      this.toggle();
      window.scrollTo(0, 0);
    }
    this.handleProps();
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleWindowResize);
    this.handleWindowResize();
    this.handleProps();
    this.setSelectedLiActive();
  }

  componentWillUnmount() {
    this.removeEvents();
    window.removeEventListener("resize", this.handleWindowResize);
  }

  changeDefaultMenuType(e, containerClassnames) {
    e.preventDefault();
    let nextClasses = this.getMenuClassesForResize(containerClassnames);
    this.props.setContainerClassnames(0, nextClasses.join(" "));
  }

  openSubMenu(e, selectedParent) {
    e.preventDefault();
    const { containerClassnames, menuClickCount } = this.props;
    const currentClasses = containerClassnames
      ? containerClassnames.split(" ").filter(x => x != "")
      : "";

    if (!currentClasses.includes("menu-mobile")) {
      if (
        currentClasses.includes("menu-sub-hidden") &&
        (menuClickCount == 2 || menuClickCount == 0)
      ) {
        this.props.setContainerClassnames(3, containerClassnames);
      } else if (
        currentClasses.includes("menu-hidden") &&
        (menuClickCount == 1 || menuClickCount == 3)
      ) {
        this.props.setContainerClassnames(2, containerClassnames);
      } else if (
        currentClasses.includes("menu-default") &&
        !currentClasses.includes("menu-sub-hidden") &&
        (menuClickCount == 1 || menuClickCount == 3)
      ) {
        this.props.setContainerClassnames(0, containerClassnames);
      }
    } else {
      this.props.addContainerClassname(
        "sub-show-temporary",
        containerClassnames
      );
    }
    this.setState({
      viewingParentMenu : selectedParent
    });
  }
  changeViewingParentMenu(menu){
    this.toggle();

    this.setState({
      viewingParentMenu:menu
    })
  }

  render() {
    return (
      <div className="sidebar">
        <div className="main-menu">
          <div className="scroll">
            <PerfectScrollbar
              option={{ suppressScrollX: true, wheelPropagation: false }}
            >
              <Nav vertical className="list-unstyled">
                <NavItem
                  className={classnames({
                    active: ((this.state.selectedParentMenu == "dashboards" && this.state.viewingParentMenu=="" )|| this.state.viewingParentMenu=="dashboards")
                  })}
                >
                  <NavLink
                    to="/app/dashboards/default"
                    onClick={e => this.openSubMenu(e, "dashboards")}
                  >
                    <i className="iconsmind-Digital-Drawing" />{" "}
                    <IntlMessages id="menu.dashboards" />
                  </NavLink>
                </NavItem>


                <NavItem
                  className={classnames({
                    active: ((this.state.selectedParentMenu == "layouts" && this.state.viewingParentMenu=="" ) || this.state.viewingParentMenu=="layouts")
                  })}
                >
                  <NavLink
                    to="/app/layouts/campaigns"
                    onClick={e => this.openSubMenu(e, "layouts")}
                  >
                    <i className="iconsmind-Soccer-Shoes" />{" "}
                    <IntlMessages id="menu.layouts" />
                  </NavLink>
                </NavItem>
                <NavItem
                  className={classnames({
                    active: ((this.state.selectedParentMenu == "ui" && this.state.viewingParentMenu=="" )|| this.state.viewingParentMenu=="ui")
                  })}
                >
                  <NavLink
                    to="/app/ui"
                    onClick={e => this.openSubMenu(e, "ui")}
                  >
                    <i className="iconsmind-Pantone" />{" "}
                    <IntlMessages id="menu.ui" />
                  </NavLink>
                </NavItem>
                <NavItem
                  className={classnames({
                    active: ((this.state.selectedParentMenu == "menu" && this.state.viewingParentMenu=="" )|| this.state.viewingParentMenu=="menu")
                  })}
                >
                  <NavLink
                    to="/app/menu"
                    onClick={e => this.openSubMenu(e, "menu")}
                  >
                    <i className="iconsmind-Data-Transfer" />{" "}
                    <IntlMessages id="menu.menu" />
                  </NavLink>
                </NavItem>
                <NavItem
                  className={classnames({
                    active: ((this.state.selectedParentMenu == "landingpage" && this.state.viewingParentMenu=="" )|| this.state.viewingParentMenu=="landingpage")
                  })}
                >
                  <NavLink
                    to="/app/layouts/wallet"
                  >
                    <i className="iconsmind-Wallet-2" />{" "}
                    <IntlMessages id="menu.landingpage" />
                  </NavLink>
                </NavItem>
              </Nav>
            </PerfectScrollbar>
          </div>
        </div>

        <div className="sub-menu">
          <div className="scroll">
            <PerfectScrollbar
              option={{ suppressScrollX: true, wheelPropagation: false }}
            >
              <Nav
                className={classnames({
                  "d-block": ((this.state.selectedParentMenu == "dashboards" && this.state.viewingParentMenu=="" )|| this.state.viewingParentMenu=="dashboards")
                })}
                data-parent="dashboards"
              >
                <NavItem>
                  <NavLink to="/app/dashboards/default">
                    <i className="simple-icon-briefcase" />{" "}
                    <IntlMessages id="menu.default" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/dashboards/analytics">
                    <i className="simple-icon-pie-chart" />{" "}
                    <IntlMessages id="menu.analytics" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/dashboards/ecommerce">
                    <i className="simple-icon-basket-loaded" />{" "}
                    <IntlMessages id="menu.ecommerce" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/dashboards/content">
                    <i className="simple-icon-doc" />{" "}
                    <IntlMessages id="menu.content" />
                  </NavLink>
                </NavItem>
              </Nav>

              <Nav
                className={classnames({
                  "d-block": ((this.state.selectedParentMenu == "layouts" && this.state.viewingParentMenu=="" )|| this.state.viewingParentMenu=="layouts")
                })}
                data-parent="layouts"
              >
                <NavItem>
                  <NavLink to="/app/layouts/campaigns">
                    <i className="iconsmind-Financial" />{" "}
                    <IntlMessages id="menu.campaigns" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/layouts/image-list">
                    <i className="iconsmind-Football-2" />{" "}
                    <IntlMessages id="menu.all-players" />
                  </NavLink>
                </NavItem>
              </Nav>
              <Nav
                className={classnames({
                  "d-block": ((this.state.selectedParentMenu == "applications" && this.state.viewingParentMenu=="" )|| this.state.viewingParentMenu=="applications")
                })}
                data-parent="applications"
              >
                <NavItem>
                  <NavLink to="/app/applications/todo">
                    <i className="simple-icon-check" />{" "}
                    <IntlMessages id="menu.todo" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/applications/survey">
                    <i className="simple-icon-calculator" />{" "}
                    <IntlMessages id="menu.survey" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/applications/chat">
                    <i className="simple-icon-bubbles" />{" "}
                    <IntlMessages id="menu.chat" />
                  </NavLink>
                </NavItem>
              </Nav>
              <Nav
                className={classnames({
                  "d-block": ((this.state.selectedParentMenu == "ui" && this.state.viewingParentMenu=="" )|| this.state.viewingParentMenu=="ui")
                })}
                data-parent="ui"
              >
                <NavItem>
                  <NavLink to="/app/ui/alerts">
                    <i className="simple-icon-bell" />{" "}
                    <IntlMessages id="menu.messages" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/ui/badges">
                    <i className="simple-icon-badge" />{" "}
                    <IntlMessages id="menu.groups" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/ui/modal">
                    <i className="simple-icon-docs" />{" "}
                    <IntlMessages id="menu.modal" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/ui/navigation">
                    <i className="simple-icon-cursor" />{" "}
                    <IntlMessages id="menu.navigation" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/ui/popover-tooltip">
                    <i className="simple-icon-pin" />{" "}
                    <IntlMessages id="menu.popover-tooltip" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/app/ui/sortable">
                    <i className="simple-icon-shuffle" />{" "}
                    <IntlMessages id="menu.sortable" />
                  </NavLink>
                </NavItem>
              </Nav>


              <Nav
                className={classnames({
                  "d-block": ((this.state.selectedParentMenu == "menu" && this.state.viewingParentMenu=="" )|| this.state.viewingParentMenu=="menu")
                })}
                data-parent="menu"
              >
                <NavItem>
                  <NavLink
                    to="#"
                    onClick={e => this.changeDefaultMenuType(e, "menu-default")}
                  >
                    <i className="simple-icon-control-pause" />{" "}
                    <IntlMessages id="menu.default" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    to="#"
                    onClick={e =>
                      this.changeDefaultMenuType(e, "menu-sub-hidden")
                    }
                  >
                    <i className="simple-icon-arrow-left" />{" "}
                    <IntlMessages id="menu.subhidden" />
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    to="#"
                    onClick={e => this.changeDefaultMenuType(e, "menu-hidden")}
                  >
                    <i className="simple-icon-control-start" />{" "}
                    <IntlMessages id="menu.hidden" />
                  </NavLink>
                </NavItem>
              </Nav>
            </PerfectScrollbar>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ menu }) => {
  const {
    containerClassnames,
    subHiddenBreakpoint,
    menuHiddenBreakpoint,
    menuClickCount
  } = menu;
  return {
    containerClassnames,
    subHiddenBreakpoint,
    menuHiddenBreakpoint,
    menuClickCount
  };
};
export default withRouter(
  connect(
    mapStateToProps,
    { setContainerClassnames, addContainerClassname, changeDefaultClassnames }
  )(Sidebar)
);
