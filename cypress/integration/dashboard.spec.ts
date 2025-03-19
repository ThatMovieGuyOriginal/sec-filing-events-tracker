// cypress/integration/dashboard.spec.ts
describe('Dashboard', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/events/upcoming*', { fixture: 'upcoming-events.json' }).as('getUpcomingEvents');
    cy.intercept('GET', '/api/user/subscription', { fixture: 'user-subscription.json' }).as('getUserSubscription');
    
    // Login and navigate to dashboard
    cy.login();
    cy.visit('/');
  });

  it('should display dashboard with events', () => {
    // Wait for API requests to complete
    cy.wait('@getUpcomingEvents');
    cy.wait('@getUserSubscription');
    
    // Check that page elements are present
    cy.contains('h1', 'SEC Filing Events').should('be.visible');
    cy.contains('button', 'Calendar').should('be.visible');
    cy.contains('button', 'Table').should('be.visible');
    
    // Check calendar view is shown by default
    cy.get('.rbc-calendar').should('be.visible');
    
    // Check events are displayed
    cy.get('.rbc-event').should('have.length.at.least', 1);
    
    // Test switching to table view
    cy.contains('button', 'Table').click();
    cy.get('.rbc-calendar').should('not.exist');
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length.at.least', 1);
    
    // Check if all shown events are of the selected type
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).contains('Insider Buying');
    });
  });

  it('should show event details when clicked', () => {
    cy.wait('@getUpcomingEvents');
    
    // Switch to table view for easier testing
    cy.contains('button', 'Table').click();
    
    // Click on View Details button
    cy.contains('View Details').first().click();
    
    // Verify modal appears
    cy.get('.fixed.inset-0').should('be.visible');
    cy.contains('h3', /(Name Change|Ticker Change|Insider Buying)/).should('be.visible');
    
    // Close modal
    cy.contains('button', 'Close').click();
    cy.get('.fixed.inset-0').should('not.exist');
  });
});
