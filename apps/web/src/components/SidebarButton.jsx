import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { tv } from 'tailwind-variants';

const SidebarButton = ({ children, to, end = false }) => {
    const sidebar = tv({
        base: 'flex items-center gap-2 rounded-lg px-6 py-3 transition-all duration-200',
        variants: {
            color: {
                unselected:
                    'text-brand-white text-opacity-70 hover:text-brand-gold hover:bg-brand-white hover:bg-opacity-5',
                selected:
                    'bg-brand-gold text-brand-dark-green font-semibold shadow-md',
            },
        },
    });

    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                sidebar({ color: isActive ? 'selected' : 'unselected' })
            }
        >
            {children}
        </NavLink>
    );
};

SidebarButton.propTypes = {
    children: PropTypes.node.isRequired,
    to: PropTypes.string.isRequired,
    end: PropTypes.bool,
    // node: qualquer coisa que pode ser renderizada, como texto, número, elemento React, etc.
};

export default SidebarButton;
