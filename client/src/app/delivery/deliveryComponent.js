(function () {
    /* global _ */
    "use strict";

    var module = angular.module("celebrate-taste");
    var deliveryId;

    module.component("delivery", {
        templateUrl: "app/delivery/delivery.html",
        controllerAs: "vm",
        controller: [
            "$route",
            "$window",
            "deliveryService",
            "helperValidator",
            "helperService",
            "orderLineService",
            "$uibModal",
            "menuService",
            "toastr",
            "customerEmployeeService",
            "orderService",
            "deliveryLogService",
            "badgeService",
            "$timeout",
            controller
        ]
    });

    function controller(
        $route,
        $window,
        deliveryService,
        helperValidator,
        helperService,
        orderLineService,
        $uibModal,
        menuService,
        toastr,
        customerEmployeeService,
        orderService,
        deliveryLogService,
        badgeService,
        $timeout
    ) {
        var vm = this;

        //
        // lifecycle hooks (chronological)
        //
        vm.$onInit = function () {
            vm.delivery = {};
            vm.errors = {};
            vm.selectedPreference = "Toate pref.";
            vm.deliverySummary = {};

            vm.obj = {};
            vm.obj.isFocusOnBadge = true;
            vm.preferences = ["A", "B", "C", "D"];
            getBadges();
            getCustomerEmployees();

            // Firefox ignores autocomplete="off" for passwords so we have to reset this field manualy
            // http://stackoverflow.com/a/2531
            //$timeout(resetInputField, 3000);
        };

        // function resetInputField(){
        //     vm.obj.badgeCode = "";
        // }

        vm.$routerOnActivate = function (next, previous) {
            deliveryId = next.params.id;
            vm.isEditMode = next.routeData.data.action === "edit";
            getDelivery();
        };

        //
        // public methods
        //
        vm.openDeliveryLine = function (orderLine, status) {
            var templateUrl = "app/delivery/openToCompleteTpl.html";
            if (orderLine.status === "completed") {
                templateUrl = "app/delivery/openToRevokeTpl.html";
            }

            setDishOptions(orderLine);

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: templateUrl,
                controller: "openDeliveryLineTplController",
                resolve: {
                    dataToModal: function () {
                        return {
                            orderLine: orderLine,
                            option1: vm.option1,
                            option2: vm.option2
                        };
                    }
                }
            });

            modalInstance.result.then(
                function () {
                    // "yyyy-mm-dd"
                    //vm.refresh();
                    if (status === "open") vm.refreshOpen();
                    else vm.refreshCompleted();
                },
                function () {
                    //$log.info('Modal dismissed at: ' + new Date());
                }
            );
        };

        vm.goBack = function () {
            $window.history.back();
        };

        // handle 'open' lines
        vm.refreshOpen = function () {
            getOrderLinesOpen();
        };

        vm.selectTabOpen = function () {
            getOrderLinesOpen();
        };

        // handle 'completed' lines
        vm.refreshCompleted = function () {
            getOrderLinesCompleted();
        };

        vm.selectTabCompleted = function (status) {
            getOrderLinesCompleted();
        };

        vm.selectTab1 = function () {
            vm.obj.isFocusOnBadge = true;
            vm.errorValidation = false; // remove any error message
            vm.orderLine = undefined;
            getDeliverySummary(vm.delivery.orderId, vm.delivery.eatSeries);
        };

        vm.deliverByBadge = function (form) {
            vm.errorValidation = false; // remove any error message
            vm.orderLine = undefined; // clean up the screen
            vm.obj.badgeCode = vm.obj.badgeCode.trim();
            if (vm.obj.badgeCode.length !== 10 || isNaN(vm.obj.badgeCode)) {
                showMessage("'" + vm.obj.badgeCode + "' este un cod invalid! (nu are 10 cifre)");
                vm.obj.badgeCode = ""; // reset badgeCode in UI
                vm.obj.isFocusOnBadge = true;
                return;
            }

            var newBadgeCode = getNewBadge(vm.obj.badgeCode); // '0007453659' --> '0011348091'

            var badge = _.find(vm.badges, { code: newBadgeCode });
            if (!badge) {
                showMessage("Card negasit: " + newBadgeCode);
                vm.obj.badgeCode = ""; // reset badgeCode in UI
                vm.obj.isFocusOnBadge = true;
            } else {
                var newEmployeeName = badge.ownerCode;

                // check to see if there is an adjustedName
                var customerEmployee = _.find(vm.customerEmployees, function (c) {
                    return normalize(c.adjustedName) === normalize(badge.ownerCode);
                });

                if (customerEmployee) {
                    newEmployeeName = customerEmployee.name;
                }

                orderLineService
                    .getOrderLinesByEmployeeName(vm.delivery.orderId, newEmployeeName)
                    .then(function (orderLines) {
                        if (orderLines.length === 0) {
                            showMessage("Lipsa comanda pt. '" + newEmployeeName + "'.");
                        } else if (orderLines.length > 1) {
                            showMessage("Exista mai multe comenzi pentru aceeasi persoana: '" + newEmployeeName + "'.");
                        } else if (orderLines[0].eatSeries !== vm.delivery.eatSeries) {
                            if (orderLines[0].status === "completed")
                                showMessage("'" + newEmployeeName + "' a mancat in " + orderLines[0].eatSeries + ".");
                            else
                                showMessage(
                                    "'" + newEmployeeName + "' a fost programat in " + orderLines[0].eatSeries + "."
                                );
                        } else {
                            vm.orderLine = orderLines[0];

                            if (vm.orderLine.status !== "completed") {
                                // set orderLine as 'completed' and save
                                var orderLineClone = {};
                                angular.copy(vm.orderLine, orderLineClone); // deep copy (to deal with status and 'strike-through')

                                orderLineClone.status = "completed";
                                orderLineClone.deliveryDate = new Date();
                                orderLineClone.deliveryMode = "card";

                                orderLineService
                                    .update(orderLineClone)
                                    .then(function (data) {
                                        vm.deliverySummary = data.data;
                                        toastr.success("Livrarea a fost inregistrata!");
                                    })
                                    .catch(function (err) {
                                        alert(JSON.stringify(err.data, null, 4));
                                    });
                            }

                            setDishOptions(vm.orderLine);
                        }
                        vm.obj.badgeCode = ""; // reset badgeCode in UI
                        vm.obj.isFocusOnBadge = true;
                    })
                    .catch(function (err) {
                        alert(JSON.stringify(err, null, 4));
                    });
            }
        };

        // return an orderLine back to open status
        vm.revoke = function (orderLine) {
            orderLine.status = "open";
            delete orderLine.deliveryDate;

            orderLineService
                .update(orderLine)
                .then(function (data) {
                    toastr.success("Livrarea a fost anulata!");
                    vm.orderLine = undefined; // clean up the screen
                    vm.obj.isFocusOnBadge = true;
                    vm.deliverySummary = data.data;
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        };

        vm.badgesFilter = function (orderLine) {
            if (vm.obj.onlyNoBadges) {
                return !orderLine.badgeCode;
            } else return true;
        };

        vm.selectPreference = function (preference) {
            if (preference === "Toate pref.") {
                vm.selectedPreference = "Toate pref.";
            } else {
                vm.selectedPreference = preference;
            }
        };

        vm.preferencesFilter = function (orderLine) {
            if (vm.selectedPreference === "Toate pref.") {
                return true;
            } else if (vm.selectedPreference === "A" || vm.selectedPreference === "B") {
                return orderLine.option1 === vm.selectedPreference;
            } else if (vm.selectedPreference === "C" || vm.selectedPreference === "D") {
                return orderLine.option2 === vm.selectedPreference;
            } else if (vm.selectedPreference === "Fara pref.") {
                return !(orderLine.option1 && orderLine.option2);
            }
        };

        //
        // private methods
        //
        function getDelivery() {
            deliveryService
                .getById(deliveryId)
                .then(function (data) {
                    vm.delivery = data;
                    vm.dateAsShortString = dt(vm.delivery.orderDate).dateAsShortString;
                    getMenus(vm.delivery.orderDate);
                    getDeliverySummary(data.orderId, data.eatSeries);
                })
                .catch(function (err) {
                    if (err.status !== 401) {
                        alert(JSON.stringify(err, null, 4));
                    }
                });
        }

        function getDeliverySummary(orderId, eatSeries) {
            orderService
                .getDeliverySummary(orderId, eatSeries)
                .then(function (data) {
                    vm.deliverySummary = data;
                })
                .catch(function (err) {
                    alert(JSON.stringify(err, null, 4));
                });
        }

        function getMenus(orderDate) {
            menuService
                .getMenu(orderDate)
                .then(function (data) {
                    vm.menu = data[0];
                })
                .catch(function (err) {
                    alert(JSON.stringify(err, null, 4));
                });
        }

        function getBadges() {
            badgeService
                .getAll()
                .then(function (data) {
                    vm.badges = data;
                })
                .catch(function (err) {
                    alert(JSON.stringify(err, null, 4));
                });
        }

        function getCustomerEmployees() {
            customerEmployeeService
                .getAll()
                .then(function (data) {
                    vm.customerEmployees = data;
                })
                .catch(function (err) {
                    alert(JSON.stringify(err, null, 4));
                });
        }

        function dt(dateAsString) {
            // yyyy-mm-dd
            return helperService.getObjFromString(dateAsString);
        }

        function getOrderLinesOpen() {
            orderLineService
                .getOrderLinesBySeriesAndStatus(vm.delivery.orderId, vm.delivery.eatSeries, "open")
                .then(function (data) {
                    vm.orderLinesOpen = data;
                })
                .catch(function (err) {
                    alert(JSON.stringify(err, null, 4));
                });
        }

        function getOrderLinesCompleted() {
            orderLineService
                .getOrderLinesBySeriesAndStatus(vm.delivery.orderId, vm.delivery.eatSeries, "completed")
                .then(function (data) {
                    vm.orderLinesCompleted = _.orderBy(data, "deliveryDate", "desc");
                })
                .catch(function (err) {
                    alert(JSON.stringify(err, null, 4));
                });
        }

        function setDishOptions(orderLine) {
            if (vm.menu) {
                vm.option1 = _.find(vm.menu.dishes, { option: orderLine.option1 });
                vm.option2 = _.find(vm.menu.dishes, { option: orderLine.option2 });
            }
        }

        function getNewBadge(inputCode) {
            // '0007453659'; (first code printed on card)
            var intCode = parseInt(inputCode, 10); // 7453659 (int)
            var hexaCode = intCode.toString(16); // 71BBDB (hex)

            var startHex = hexaCode.substr(0, hexaCode.length - 4); // 71 (hex)
            var endHex = hexaCode.substr(hexaCode.length - 4); // BBDB (hex)

            if (startHex.length > 2) {
                startHex = startHex.substr(startHex.length - 2); // in first group, keep only last 2 chars
            }

            var startInt = parseInt(startHex, 16); // 113 (int)
            var endInt = parseInt(endHex, 16); // 48091 (int)

            // pad each part with zero
            var startPadded = padDigits(startInt, 5); // '00113' (str)
            var endPadded = padDigits(endInt, 5); // '48091' (str)

            //var aggInt = startInt.toString() + endInt.toString(); // '11348091'

            //var rez = padDigits(aggInt, 10); // '0011348091' (last code printed on card)
            return startPadded + endPadded;
        }

        //http://stackoverflow.com/a/10075654
        // padDigits(23, 4); --> "0023"
        function padDigits(number, digits) {
            return Array(Math.max(digits - String(number).length + 1, 0)).join("0") + number;
        }

        function normalize(str) {
            if (!str) return undefined;
            return (
                str
                    .toLowerCase()
                    //.replace(/-/g , ' ') // replace dash with one space
                    .replace(/ {2,}/g, " ")
            ); // replace multiple spaces with a single space
        }

        function showMessage(msg) {
            vm.errorValidation = true;
            vm.errorMessage = msg;

            // collect log info
            var log = {
                orderDate: vm.delivery.orderDate,
                series: vm.delivery.eatSeries,
                msg: msg
            };

            deliveryLogService
                .create(log)
                .then(function () {
                    toastr.success("Datele despre acest card au fost memorate pt. investigatii ulterioare.");
                })
                .catch(function (err) {
                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    }
})();
