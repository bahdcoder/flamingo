import cn from 'classnames'
import React, { Fragment } from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import {
    Dropdown,
    DropdownList,
    DropdownListItem,
    Paragraph,
} from '@contentful/forma-36-react-components'

import ShowResource from '~/pages/ShowResource'
import ResourceIndex from '~/pages/ResourceIndex'
import CreateResource from '~/pages/CreateResource'
import DashboardIndex from '~/pages/DashboardIndex'

import { withResources } from '~/store/resources'
import { mustBeAuthenticated } from '~/store/auth'

import ArrowIcon from '~/components/ArrowIcon'
import PageLayout from '~/components/PageLayout'

class DashboardPage extends React.Component {
    state = this.defaultState()

    defaultState() {
        let groups = []

        groups = this.populateGroups('dashboards', groups)
        groups = this.populateGroups('resources', groups)

        return {
            groups,
            accountMenuOpen: false,
        }
    }

    populateGroups(elementName, groups) {
        this.props[elementName]
            .filter((resource) => resource.displayInNavigation)
            .forEach((element) => {
                const groupExists = groups.findIndex(
                    (group) => group.name === element.group
                )

                if (groupExists === -1) {
                    groups.push({
                        open: true,
                        slug: element.groupSlug,
                        name: element.group,
                        items: [
                            {
                                slug: element.slug,
                                label: element.label || element.name,
                                to: Tensei.getPath(
                                    `${elementName}/${element.slug}`
                                ),
                            },
                        ],
                    })
                } else {
                    groups[groupExists] = {
                        ...groups[groupExists],
                        items: [
                            ...groups[groupExists].items,
                            {
                                slug: element.slug,
                                label: element.label,
                                to: Tensei.getPath(
                                    `${elementName}/${element.slug}`
                                ),
                            },
                        ],
                    }
                }
            })

        return groups
    }

    logout = () => {
        Tensei.request.post('logout').then(() => {
            window.location.href = Tensei.getPath('auth/login')
        })
    }

    toggleAccountMenu = () => {
        this.setState({
            accountMenuOpen: !this.state.accountMenuOpen,
        })
    }

    toggleGroup = (groupToToggle) => {
        this.setState({
            groups: this.state.groups.map((group) => {
                if (group.slug === groupToToggle.slug) {
                    return {
                        ...group,
                        open: !group.open,
                    }
                }

                return group
            }),
        })
    }

    renderGroups = () => {
        return (
            <>
                {this.state.groups.map((group) => (
                    <Fragment key={group.slug}>
                        <header
                            onClick={() => this.toggleGroup(group)}
                            className="flex items-center border-b border-gray-lightest-100 p-3 cursor-pointer hover:bg-gray-lightest-100 transition duration-75 w-full uppercase text-blue-darkest-200 font-bold text-xs"
                        >
                            <ArrowIcon
                                className={cn(
                                    'mr-3 transition duration-75 transform text-blue-darkest',
                                    {
                                        '-rotate-90': !group.open,
                                    }
                                )}
                            />
                            {group.name}
                        </header>
                        {group.open &&
                            group.items.map((item) => (
                                <Link key={item.slug} to={item.to}>
                                    <div
                                        className={cn(
                                            'w-full py-3 pl-10 pr-3 text-sm cursor-pointer hover:bg-gray-lightest-200 transition duration-75',
                                            {
                                                'bg-gray-lightest-100': this.props.location.pathname.match(
                                                    item.to
                                                ),
                                            }
                                        )}
                                    >
                                        {item.label}
                                    </div>
                                </Link>
                            ))}
                    </Fragment>
                ))}
            </>
        )
    }

    render() {
        const { accountMenuOpen } = this.state
        return (
            <div className="w-full">
                <div className="w-full h-topbar bg-blue-darkest flex items-center text-white justify-between">
                    <span></span>
                    <span></span>
                    <div>
                        <Dropdown
                            isOpen={accountMenuOpen}
                            onClose={this.toggleAccountMenu}
                            isAutoalignmentEnabled={true}
                            toggleElement={
                                <div
                                    data-testid="dashboard-header-dropdown"
                                    onClick={this.toggleAccountMenu}
                                    className={cn(
                                        'shadow-account-menu cursor-pointer px-5 h-topbar flex items-center justify-center',
                                        {
                                            'bg-blue-darkest-200 hover:bg-blue-darkest-300': !accountMenuOpen,
                                            'bg-blue-darkest-300': accountMenuOpen,
                                        }
                                    )}
                                >
                                    <img
                                        className="w-8 h-8 rounded-full"
                                        src="https://avatars.githubusercontent.com/u/19477966?v=3"
                                        alt=""
                                    />
                                    <ArrowIcon className="ml-3 text-white w-4 h-4" />
                                </div>
                            }
                        >
                            <DropdownList data-testid="dashboard-header-dropdown-list">
                                <DropdownListItem onClick={console.log}>
                                    Account settings
                                </DropdownListItem>
                            </DropdownList>
                            <DropdownList
                                border="top"
                                data-testid="dashboard-header-dropdown-list"
                            >
                                <DropdownListItem onClick={this.logout}>
                                    Logout
                                </DropdownListItem>
                            </DropdownList>
                        </Dropdown>
                    </div>
                </div>

                <div
                    className="w-full flex flex-wrap"
                    style={{ height: 'calc(100vh - 4.375rem)' }}
                >
                    <div className="border-r border-gray-lighter h-full bg-gray-lightest w-full md:w-18-percent">
                        {this.renderGroups()}
                    </div>
                    <div className="w-full md:w-82-percent flex-grow h-full overflow-scroll">
                        <div className="py-4 px-3 pt-8 pb-12 md:px-12">
                            <Switch>
                                <Route
                                    exact
                                    component={ResourceIndex}
                                    path={Tensei.getPath('resources/:resource')}
                                />
                                <Route
                                    exact
                                    component={DashboardIndex}
                                    path={Tensei.getPath(
                                        'dashboards/:dashboard'
                                    )}
                                />
                                <Route
                                    path={Tensei.getPath(
                                        'resources/:resource/new'
                                    )}
                                    exact
                                    component={CreateResource}
                                />
                                <Route
                                    path={Tensei.getPath(
                                        'resources/:resource/:resourceId'
                                    )}
                                    exact
                                    component={ShowResource}
                                />
                                <Route
                                    path={Tensei.getPath(
                                        'resources/:resource/:resourceId/edit'
                                    )}
                                    component={CreateResource}
                                />
                            </Switch>
                            <div className="w-full flex items-center justify-center py-3 mt-24">
                                <Paragraph variant="small">
                                    © Tensei Admin {new Date().getFullYear()}
                                </Paragraph>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withResources(mustBeAuthenticated(DashboardPage))
