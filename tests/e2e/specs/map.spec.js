/// <reference types="cypress" />

describe('Map Page', () => {
    beforeEach(() => {
        cy.visit('/map');
    });

    it('should display the map page title', () => {
        cy.get('ion-title').should('contain', 'Beacon Map');
    });

    it('should show the map toolbar', () => {
        cy.get('ion-toolbar').should('exist');
    });

    it('should have a menu button in the header', () => {
        cy.get('ion-menu-button').should('exist');
    });

    it('should render the map content area', () => {
        cy.get('ion-content').should('exist');
    });

    it('should have a FAB button for scanning on the map', () => {
        cy.get('ion-fab').should('exist');
        cy.get('ion-fab-button').should('exist');
    });

    it('should render the map container', () => {
        cy.get('#container').should('exist');
    });

    it('should navigate to map with beacon UID parameter', () => {
        cy.visit('/map/test-beacon-uid');
        cy.url().should('include', '/map/test-beacon-uid');
        cy.get('ion-title').should('contain', 'Beacon Map');
    });
});
